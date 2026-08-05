module prediction_market::market {
    use std::string::{Self, String};
    use std::vector;
    use std::signer;
    use std::hash;
    use std::bcs;
    use std::option::{Self, Option};
    use aptos_framework::coin::{Self};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::account::{Self, SignerCapability};

    // ─── Errors ────────────────────────────────────────────────
    const E_NOT_OWNER: u64 = 1;
    const E_MARKET_NOT_FOUND: u64 = 2;
    const E_QUESTION_REQUIRED: u64 = 3;
    const E_NEED_TWO_OUTCOMES: u64 = 4;
    const E_TOO_MANY_OUTCOMES: u64 = 5;
    const E_END_MUST_BE_FUTURE: u64 = 6;
    const E_END_AFTER_START: u64 = 7;
    const E_NOT_STARTED: u64 = 8;
    const E_ALREADY_ENDED: u64 = 9;
    const E_ALREADY_RESOLVED: u64 = 10;
    const E_ZERO_AMOUNT: u64 = 11;
    const E_INVALID_OUTCOME: u64 = 12;
    const E_ALREADY_BET: u64 = 13;
    const E_BAD_ACCESS_CODE: u64 = 14;
    const E_NOT_ENDED: u64 = 15;
    const E_NOT_AUTHORIZED: u64 = 16;
    const E_NOT_RESOLVED: u64 = 17;
    const E_NO_BET: u64 = 18;
    const E_ALREADY_CLAIMED: u64 = 19;
    const E_NOT_WINNER: u64 = 20;

    const CREATOR_FEE_BPS: u64 = 120;   // 1.2%
    const PLATFORM_FEE_BPS: u64 = 80;   // 0.8%
    const BPS_DENOM: u64 = 10000;

    struct Bet has store, copy, drop {
        amount: u64,
        outcome_index: u64,
        claimed: bool,
    }

    struct Market has store {
        id: u64,
        question: String,
        rules: String,
        image_uri: String,
        category: String,
        outcome_labels: vector<String>,
        outcome_pools: vector<u64>,
        end_time: u64,
        start_time: u64,
        total_pool: u64,
        resolved: bool,
        winning_outcome: u64,
        creator: address,
        created_at: u64,
        is_private: bool,
        access_code_hash: vector<u8>,
        resolution_type: u8, // 0 = manual, 1 = AI oracle
        bettors: vector<address>,
        bets: vector<BetEntry>,
    }

    struct BetEntry has store, copy, drop {
        bettor: address,
        bet: Bet,
    }

    struct MarketStore has key {
        markets: vector<Market>,
        owner: address,
        total_platform_fees: u64,
        vault_cap: SignerCapability,
        create_events: event::EventHandle<MarketCreatedEvent>,
        bet_events: event::EventHandle<BetPlacedEvent>,
        resolve_events: event::EventHandle<MarketResolvedEvent>,
        claim_events: event::EventHandle<WinningsClaimedEvent>,
    }

    struct MarketCreatedEvent has drop, store {
        market_id: u64,
        question: String,
        category: String,
        outcome_count: u64,
        start_time: u64,
        end_time: u64,
        creator: address,
        is_private: bool,
        resolution_type: u8,
    }

    struct BetPlacedEvent has drop, store {
        market_id: u64,
        bettor: address,
        outcome_index: u64,
        amount: u64,
    }

    struct MarketResolvedEvent has drop, store {
        market_id: u64,
        winning_outcome: u64,
        total_pool: u64,
    }

    struct WinningsClaimedEvent has drop, store {
        market_id: u64,
        bettor: address,
        payout: u64,
    }

    /// Must be called once by the deployer to initialize storage.
    /// Creates a resource-account vault (seeded, deterministic address) that custodies
    /// all AptosCoin stakes so the module can programmatically pay out winnings/fees.
    public entry fun init(admin: &signer, seed: vector<u8>) {
        let addr = signer::address_of(admin);
        assert!(!exists<MarketStore>(addr), E_ALREADY_RESOLVED);
        let (vault_signer, vault_cap) = account::create_resource_account(admin, seed);
        coin::register<AptosCoin>(&vault_signer);
        move_to(admin, MarketStore {
            markets: vector::empty<Market>(),
            owner: addr,
            total_platform_fees: 0,
            vault_cap,
            create_events: account::new_event_handle<MarketCreatedEvent>(admin),
            bet_events: account::new_event_handle<BetPlacedEvent>(admin),
            resolve_events: account::new_event_handle<MarketResolvedEvent>(admin),
            claim_events: account::new_event_handle<WinningsClaimedEvent>(admin),
        });
    }

    #[view]
    public fun vault_address(store_addr: address): address acquires MarketStore {
        account::get_signer_capability_address(&borrow_global<MarketStore>(store_addr).vault_cap)
    }

    fun hash_code(code: &String): vector<u8> {
        if (string::length(code) == 0) {
            vector::empty<u8>()
        } else {
            hash::sha3_256(bcs::to_bytes(code))
        }
    }

    public entry fun create_market(
        creator: &signer,
        store_addr: address,
        question: String,
        rules: String,
        image_uri: String,
        category: String,
        outcomes: vector<String>,
        start_time: u64,
        end_time: u64,
        is_private: bool,
        access_code: String,
        resolution_type: u8,
        initial_liquidity: u64,
    ) acquires MarketStore {
        assert!(string::length(&question) > 0, E_QUESTION_REQUIRED);
        let n = vector::length(&outcomes);
        assert!(n >= 2, E_NEED_TWO_OUTCOMES);
        assert!(n <= 10, E_TOO_MANY_OUTCOMES);
        let now = timestamp::now_seconds();
        assert!(end_time > now, E_END_MUST_BE_FUTURE);
        let start = if (start_time == 0) { now } else { start_time };
        assert!(end_time > start, E_END_AFTER_START);

        let store = borrow_global_mut<MarketStore>(store_addr);
        let market_id = vector::length(&store.markets);

        let labels = vector::empty<String>();
        let pools = vector::empty<u64>();
        let i = 0;
        while (i < n) {
            vector::push_back(&mut labels, *vector::borrow(&outcomes, i));
            vector::push_back(&mut pools, 0);
            i = i + 1;
        };
        vector::push_back(&mut labels, string::utf8(b"Unclassified"));
        vector::push_back(&mut pools, 0);
        let total_outcomes = n + 1;

        let creator_addr = signer::address_of(creator);
        let vault_addr = account::get_signer_capability_address(&store.vault_cap);

        if (initial_liquidity > 0) {
            coin::transfer<AptosCoin>(creator, vault_addr, initial_liquidity);
            let per = initial_liquidity / total_outcomes;
            let remainder = initial_liquidity - (per * total_outcomes);
            let j = 0;
            while (j < total_outcomes) {
                let amt = per;
                if (j == 0) { amt = amt + remainder };
                let p = vector::borrow_mut(&mut pools, j);
                *p = *p + amt;
                j = j + 1;
            };
        };

        let market = Market {
            id: market_id,
            question,
            rules,
            image_uri,
            category,
            outcome_labels: labels,
            outcome_pools: pools,
            end_time,
            start_time: start,
            total_pool: initial_liquidity,
            resolved: false,
            winning_outcome: 0,
            creator: creator_addr,
            created_at: now,
            is_private,
            access_code_hash: hash_code(&access_code),
            resolution_type,
            bettors: vector::empty<address>(),
            bets: vector::empty<BetEntry>(),
        };

        event::emit_event(&mut store.create_events, MarketCreatedEvent {
            market_id, question: market.question, category: market.category,
            outcome_count: total_outcomes, start_time: start, end_time,
            creator: creator_addr, is_private, resolution_type,
        });

        vector::push_back(&mut store.markets, market);
    }

    public entry fun place_bet(
        bettor: &signer,
        store_addr: address,
        market_id: u64,
        outcome_index: u64,
        amount: u64,
        access_code: String,
    ) acquires MarketStore {
        let store = borrow_global_mut<MarketStore>(store_addr);
        assert!(market_id < vector::length(&store.markets), E_MARKET_NOT_FOUND);
        let m = vector::borrow_mut(&mut store.markets, market_id);
        let now = timestamp::now_seconds();
        assert!(now >= m.start_time, E_NOT_STARTED);
        assert!(now < m.end_time, E_ALREADY_ENDED);
        assert!(!m.resolved, E_ALREADY_RESOLVED);
        assert!(amount > 0, E_ZERO_AMOUNT);
        assert!(outcome_index < vector::length(&m.outcome_labels), E_INVALID_OUTCOME);

        let bettor_addr = signer::address_of(bettor);
        assert!(!has_bet(m, bettor_addr), E_ALREADY_BET);

        if (m.is_private) {
            assert!(hash_code(&access_code) == m.access_code_hash, E_BAD_ACCESS_CODE);
        };

        let vault_addr = account::get_signer_capability_address(&store.vault_cap);
        coin::transfer<AptosCoin>(bettor, vault_addr, amount);

        vector::push_back(&mut m.bets, BetEntry {
            bettor: bettor_addr,
            bet: Bet { amount, outcome_index, claimed: false },
        });
        vector::push_back(&mut m.bettors, bettor_addr);

        let p = vector::borrow_mut(&mut m.outcome_pools, outcome_index);
        *p = *p + amount;
        m.total_pool = m.total_pool + amount;

        event::emit_event(&mut store.bet_events, BetPlacedEvent {
            market_id, bettor: bettor_addr, outcome_index, amount,
        });
    }

    fun has_bet(m: &Market, addr: address): bool {
        let i = 0;
        let n = vector::length(&m.bets);
        while (i < n) {
            if (vector::borrow(&m.bets, i).bettor == addr) return true;
            i = i + 1;
        };
        false
    }

    fun find_bet_index(m: &Market, addr: address): Option<u64> {
        let i = 0;
        let n = vector::length(&m.bets);
        while (i < n) {
            if (vector::borrow(&m.bets, i).bettor == addr) return option::some(i);
            i = i + 1;
        };
        option::none<u64>()
    }

    public entry fun resolve_market(
        resolver: &signer,
        store_addr: address,
        market_id: u64,
        winning_outcome: u64,
    ) acquires MarketStore {
        let store = borrow_global_mut<MarketStore>(store_addr);
        assert!(market_id < vector::length(&store.markets), E_MARKET_NOT_FOUND);
        let owner = store.owner;
        let vault_signer = account::create_signer_with_capability(&store.vault_cap);
        let total_platform_fees = &mut store.total_platform_fees;
        let m = vector::borrow_mut(&mut store.markets, market_id);
        assert!(!m.resolved, E_ALREADY_RESOLVED);
        let now = timestamp::now_seconds();
        assert!(now >= m.end_time, E_NOT_ENDED);
        assert!(winning_outcome < vector::length(&m.outcome_labels), E_INVALID_OUTCOME);

        let resolver_addr = signer::address_of(resolver);
        if (m.resolution_type == 0) {
            assert!(resolver_addr == m.creator, E_NOT_AUTHORIZED);
        } else {
            assert!(resolver_addr == owner, E_NOT_AUTHORIZED);
        };

        m.resolved = true;
        m.winning_outcome = winning_outcome;

        let creator_fee = (m.total_pool * CREATOR_FEE_BPS) / BPS_DENOM;
        let platform_fee = (m.total_pool * PLATFORM_FEE_BPS) / BPS_DENOM;
        *total_platform_fees = *total_platform_fees + platform_fee;

        if (creator_fee > 0) {
            coin::transfer<AptosCoin>(&vault_signer, m.creator, creator_fee);
        };
        if (platform_fee > 0) {
            coin::transfer<AptosCoin>(&vault_signer, owner, platform_fee);
        };

        event::emit_event(&mut store.resolve_events, MarketResolvedEvent {
            market_id, winning_outcome, total_pool: m.total_pool,
        });
    }

    public entry fun claim_winnings(
        claimer: &signer,
        store_addr: address,
        market_id: u64,
    ) acquires MarketStore {
        let store = borrow_global_mut<MarketStore>(store_addr);
        assert!(market_id < vector::length(&store.markets), E_MARKET_NOT_FOUND);
        let vault_signer = account::create_signer_with_capability(&store.vault_cap);
        let m = vector::borrow_mut(&mut store.markets, market_id);
        assert!(m.resolved, E_NOT_RESOLVED);

        let claimer_addr = signer::address_of(claimer);
        let idx_opt = find_bet_index(m, claimer_addr);
        assert!(option::is_some(&idx_opt), E_NO_BET);
        let idx = option::extract(&mut idx_opt);
        let entry = vector::borrow_mut(&mut m.bets, idx);
        assert!(!entry.bet.claimed, E_ALREADY_CLAIMED);
        assert!(entry.bet.outcome_index == m.winning_outcome, E_NOT_WINNER);

        let total_fees_bps = CREATOR_FEE_BPS + PLATFORM_FEE_BPS;
        let distributable = m.total_pool - ((m.total_pool * total_fees_bps) / BPS_DENOM);
        let win_pool = *vector::borrow(&m.outcome_pools, m.winning_outcome);
        let payout = if (win_pool > 0) { (entry.bet.amount * distributable) / win_pool } else { 0 };

        entry.bet.claimed = true;

        if (payout > 0) {
            coin::transfer<AptosCoin>(&vault_signer, claimer_addr, payout);
        };

        event::emit_event(&mut store.claim_events, WinningsClaimedEvent {
            market_id, bettor: claimer_addr, payout,
        });
    }

    #[view]
    public fun market_count(store_addr: address): u64 acquires MarketStore {
        vector::length(&borrow_global<MarketStore>(store_addr).markets)
    }

    #[view]
    public fun get_market(store_addr: address, market_id: u64): (
        u64, String, String, String, String, vector<String>, vector<u64>,
        u64, u64, u64, bool, u64, address, u64, bool, u8
    ) acquires MarketStore {
        let store = borrow_global<MarketStore>(store_addr);
        let m = vector::borrow(&store.markets, market_id);
        (
            m.id, m.question, m.rules, m.image_uri, m.category,
            m.outcome_labels, m.outcome_pools, m.end_time, m.start_time,
            m.total_pool, m.resolved, m.winning_outcome, m.creator,
            m.created_at, m.is_private, m.resolution_type
        )
    }

    #[view]
    public fun get_bettor_count(store_addr: address, market_id: u64): u64 acquires MarketStore {
        let store = borrow_global<MarketStore>(store_addr);
        vector::length(&vector::borrow(&store.markets, market_id).bettors)
    }
}
