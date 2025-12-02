# Bridge Game Implementation Plan

## Overview
Transform the static card display into a fully functional bridge game with trick-taking mechanics, legal play validation, and automated AI players.

## User Requirements
- **Scope:** Full bridge game (bidding, trick-taking, scoring)
- **Player Mode:** Single human player (you), 3 AI opponents
- **Interaction:** Click cards to play them
- **First Priorities:**
  1. Trick display area (show 4 cards on table)
  2. Legal play validation (must follow suit rules)

---

## Implementation Milestones

### Milestone 1: Trick Display + Basic Card Playing ⭐ Priority 1
**Goal:** Get core trick-taking mechanic working visually

**Steps:**
1. **Enhance gameStore.js:**
   - Add state: `gamePhase` ref ('setup', 'bidding', 'playing', 'trickComplete', 'roundComplete')
   - Add state: `currentTrick` ref with { id, cards: [], leadPlayerId, winnerId, leadSuit }
   - Add state: `currentPlayer` ref (whose turn, 1-4)
   - Add state: `contract` ref with { trump, level, declarer, target }
   - Add action: `playCard(playerId, cardId)` - basic version without validation
   - Add action: `skipBidding(trump)` - quick start helper

2. **Create TrickDisplay.vue component:**
   - Display 4 cards in cross pattern (N/E/S/W positions)
   - Access currentTrick from gameStore
   - Position each card based on playerId (1=South, 2=West, 3=North, 4=East)
   - CSS for absolute positioning in 400x400 grid

3. **Make Card.vue interactive:**
   - Add props: `clickable`, `disabled`, `selected` (all boolean)
   - Add `@click` handler that emits 'card-click' event with card data
   - Add CSS classes for hover/disabled states

4. **Update App.vue:**
   - Import and render TrickDisplay component (show when gamePhase === 'playing')
   - Add `handleCardClick(card)` method that calls `game.playCard(1, card.id)`
   - Pass `clickable` prop to human player's Card components
   - Call `game.skipBidding('hearts')` in onMounted to auto-start

**Validation:** Click card → appears in trick display → turn advances

---

### Milestone 2: Legal Play Validation ⭐ Priority 2
**Goal:** Enforce bridge rules (must follow suit if possible)

**Steps:**
1. **Create useBridgeLogic.js composable:**
   - Export function `getLegalCards(hand, trick, contract)`
   - Logic: If leading, all cards legal; if following, must follow suit if possible
   - Export function `isCardLegal(card, hand, trick, contract)` - single card check

2. **Enhance gameStore.js:**
   - Add computed: `legalPlays` - calls useBridgeLogic.getLegalCards() for current player
   - Update `playCard()` action - validate with isCardLegal(), console.warn if illegal, return early

3. **Update App.vue:**
   - Add method: `isCardLegal(cardId)` - checks if cardId in game.legalPlays
   - Pass `:disabled="!isCardLegal(card.id)"` to Card components
   - Only enable cards during human's turn: `:clickable="game.currentPlayer === 1"`

**Validation:** Can only play cards in led suit (or any if void in that suit)

---

### Milestone 3: Trick Evaluation & Winner Determination
**Goal:** Determine who wins each trick correctly

**Steps:**
1. **Enhance useBridgeLogic.js:**
   - Add function `determineTrickWinner(trick, contract)`
   - Logic:
     - Find trump cards (if trump !== 'notrump')
     - If any trumps, highest trump wins
     - Otherwise, highest card in led suit wins
   - Add function `getRankValue(rank)` - helper using ranks array from useDeckLogic

2. **Enhance gameStore.js:**
   - Add state: `trickHistory` ref (array of completed tricks)
   - Add action: `evaluateTrick()` - determine winner, update trickHistory, set phase to 'trickComplete'
   - Add action: `nextTrick()` - reset currentTrick, set currentPlayer to winner, increment trick id
   - Update `playCard()` - when trick has 4 cards, call evaluateTrick()

3. **Update TrickDisplay.vue:**
   - Add CSS class for winning card (gold outline)
   - Show winner indicator

**Validation:** Correct player wins based on trump/suit rules, winner leads next trick

---

### Milestone 4: Contract & Trump System
**Goal:** Allow setting contract and respect trump suit in evaluation

**Steps:**
1. **Create GameControls.vue component:**
   - Trump selector dropdown (hearts, diamonds, clubs, spades, notrump)
   - Level selector (1-7)
   - "Start Game" button - calls game.setContract()
   - "Quick Start" button - calls game.skipBidding('hearts')

2. **Enhance gameStore.js:**
   - Add action: `setContract(level, trump, declarerId)` - sets contract ref, changes phase to 'playing'
   - Update `skipBidding()` to accept trump parameter

3. **Update App.vue:**
   - Import and render GameControls component at top

**Validation:** Trump cards beat non-trump cards of any rank

---

### Milestone 5: Automated Players
**Goal:** AI players make random legal plays automatically

**Steps:**
1. **Enhance player model in gameStore.js:**
   - Update `setPlayerCount()` - add `isHuman: true` only for player 1

2. **Add to useBridgeLogic.js:**
   - Export function `selectAutomatedPlay(player, trick, contract)`
   - Implementation: Get legal cards, return random choice

3. **Enhance gameStore.js:**
   - Add action: `executeAutomatedPlay()` - uses selectAutomatedPlay(), calls playCard()

4. **Update App.vue:**
   - Add watcher on `game.currentPlayer`:
     ```javascript
     watch(() => game.currentPlayer, (playerId) => {
       const player = game.players.find(p => p.id === playerId);
       if (player && !player.isHuman && game.gamePhase === 'playing') {
         setTimeout(() => game.executeAutomatedPlay(), 500);
       }
     }, { immediate: true });
     ```

**Validation:** Game flows automatically through AI turns, human waits for their turn

---

### Milestone 6: Scoring & Round Completion
**Goal:** Complete the game loop with scoring

**Steps:**
1. **Create ScoreDisplay.vue component:**
   - Show current contract
   - Show tricks won (N/S team vs E/W team)
   - Show current phase

2. **Enhance gameStore.js:**
   - Add state: `score` ref with { northSouth: 0, eastWest: 0 }
   - Add computed: `tricksWonByTeam` - count tricks from history
   - Add action: `endRound()` - calculate score, set phase to 'roundComplete'
   - Add action: `startNewRound()` - reset state, re-deal
   - Update `nextTrick()` - if 13 tricks complete, call endRound()

3. **Add to useBridgeLogic.js:**
   - Export function `calculateBasicScore(contract, tricksWon)` - simplified scoring

4. **Update GameControls.vue:**
   - Add "Next Round" button (show when gamePhase === 'roundComplete')

5. **Update App.vue:**
   - Import and render ScoreDisplay component

**Validation:** Full 13-trick round completes, scores calculated, can start new round

---

## Data Models

### Enhanced Player
```javascript
{
  id: number,                // 1-4
  hand: Card[],
  isHuman: boolean,          // true for player 1 only
  position: string,          // 'north', 'south', 'east', 'west'
  tricksWon: number
}
```

### Trick
```javascript
{
  id: number,                // 1-13
  cards: [{playerId, card}],
  leadPlayerId: number,
  winnerId: number | null,
  leadSuit: string | null
}
```

### Contract
```javascript
{
  level: number,             // 1-7
  trump: string,             // 'hearts', 'diamonds', 'clubs', 'spades', 'notrump'
  declarer: number,
  target: number             // 6 + level
}
```

---

## Key Architectural Decisions

1. **Validation Logic Location:** useBridgeLogic.js composable (keeps store clean, logic testable)

2. **AI Implementation:** Random selection from legal plays, triggered by watcher in App.vue

3. **Component Structure:** 6 modular components
   - Card.vue (enhanced with interactivity)
   - TrickDisplay.vue (new - shows current trick)
   - GameControls.vue (new - contract and game flow)
   - ScoreDisplay.vue (new - scores and state)
   - PlayerHand.vue (new - display other players' hands)
   - App.vue (orchestration)

4. **State Shape:** Flat refs at store level (gamePhase, currentTrick, contract, etc.)

5. **Phase Management:** Single `gamePhase` ref with string enum values

6. **Trump Handling:** String union type ('hearts' | 'diamonds' | 'clubs' | 'spades' | 'notrump')

---

## Critical Files

**To Modify:**
- `/home/daniel/Desktop/DeckOfCards/src/stores/gameStore.js` - Add all new state and actions
- `/home/daniel/Desktop/DeckOfCards/src/components/Card.vue` - Add interactivity props and events
- `/home/daniel/Desktop/DeckOfCards/src/App.vue` - Integrate new components, handle events, add AI watcher

**To Create:**
- `/home/daniel/Desktop/DeckOfCards/src/composables/useBridgeLogic.js` - All bridge game logic
- `/home/daniel/Desktop/DeckOfCards/src/components/TrickDisplay.vue` - Display current trick
- `/home/daniel/Desktop/DeckOfCards/src/components/GameControls.vue` - Contract setting UI
- `/home/daniel/Desktop/DeckOfCards/src/components/ScoreDisplay.vue` - Score and state display
- `/home/daniel/Desktop/DeckOfCards/src/components/PlayerHand.vue` - Display other players' hands

---

## Testing Checkpoints

**After Milestone 1:**
- [ ] Can click cards in hand
- [ ] Cards appear in center trick display
- [ ] After 4 cards, trick clears

**After Milestone 2:**
- [ ] Can only click legal cards (greyed out illegal ones)
- [ ] Must follow suit if possible
- [ ] Can play any card if void in led suit

**After Milestone 3:**
- [ ] Correct card wins trick
- [ ] Winner leads next trick
- [ ] Trump beats non-trump

**After Milestone 5:**
- [ ] AI players play automatically
- [ ] Game flows without manual intervention
- [ ] Only human player requires input

**After Milestone 6:**
- [ ] Full 13-trick round completes
- [ ] Scores display correctly
- [ ] Can start new round

---

## Notes

- Start with Milestone 1 for immediate visible progress
- Each milestone builds on the previous
- AI uses random selection initially (can enhance later)
- Bidding phase can be simplified initially (manual contract setting)
- Focus on getting trick-taking mechanics solid first
