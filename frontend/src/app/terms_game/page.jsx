"use client"; 


import { useState } from "react";

import Link from "next/link";

// Simple shuffle to make the cards random each time 
function shuffleArray(array) {
  // shallow copy of the array
  const copy = [...array];
  // go through the array
  for (let i = copy.length - 1; i > 0; i--) {
    // Pick a random index j between 0 and i allows to be random
    const j = Math.floor(Math.random() * (Math.random() * (i + 1)));
    // swap j and i
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  // give the shuffled copy
  return copy;
}

//main component
export default function TermsGamePage() {
  // customTerms holds the array of all user-added flashcard objects
  const [customTerms, setCustomTerms] = useState([]);

  // terms is the current deck we're studying 
  const [terms, setTerms] = useState([]);

  // Game
  // currentIndex indicates which card we're currently on
  const [currentIndex, setCurrentIndex] = useState(0);
  // showAnswer decides whether to reveal the term side of the flashcard
  const [showAnswer, setShowAnswer] = useState(false);
  // correctCount counts how many times the user marked "I got it right"
  const [correctCount, setCorrectCount] = useState(0);
  // totalAnswered counts how many cards in the current round have been answered
  const [totalAnswered, setTotalAnswered] = useState(0);
  // streak tracks the current number of consecutive correct answers
  const [streak, setStreak] = useState(0);
  // bestStreak stores the highest streak achieved during this round
  const [bestStreak, setBestStreak] = useState(0);
  // completed indicates whether we've gone through all cards in the deck once
  const [completed, setCompleted] = useState(false);

  // Inputs for creating custom flashcards
  // newTerm holds the text the user types for the term
  const [newTerm, setNewTerm] = useState("");
  // newDefinition holds the text the user types for the definition
  const [newDefinition, setNewDefinition] = useState("");

  // hasDeck is true if there is at least one card in the current terms deck
  const hasDeck = terms.length > 0;
  // currentCard is the flashcard object we are currently displaying nothing if no cards 
  const currentCard = hasDeck ? terms[currentIndex] : null;
  // progressPercent represents how much of the deck has been answered in this round
  const progressPercent = hasDeck
    ? (totalAnswered / terms.length) * 100
    : 0;

  // fully reset game with a given list of cards
  const resetGameWith = (cardList) => {
    // If the list passed in is empty, fully clear the game state
    if (!cardList.length) 
      {
      // Empty deck means no "terms" to study
      setTerms([]);
      // Reset to the first index
      setCurrentIndex(0);
      // Hide any revealed answer
      setShowAnswer(false);
      // Reset correct answer count
      setCorrectCount(0);
      // Reset total answered count
      setTotalAnswered(0);
      // Reset the current streak
      setStreak(0);
      // Reset best streak
      setBestStreak(0);
      // Mark the game as not completed
      setCompleted(false);
      // Exit early since there are no cards to shuffle
      return;
    }

    // If we do have cards, shuffle them to create a randomized deck
    const shuffled = shuffleArray(cardList);
    // Set the game deck to this shuffled list
    setTerms(shuffled);
    // Start at the first card in this new deck
    setCurrentIndex(0);
    // Hide the answer initially
    setShowAnswer(false);
    // Reset correct answers for this new run
    setCorrectCount(0);
    // Reset total answered for this new run
    setTotalAnswered(0);
    // Reset current streak
    setStreak(0);
    // Reset best streak
    setBestStreak(0);
    // Mark the game as not completed yet (new run)
    setCompleted(false);
  };

  // Convenience helper to reset the game using the current customTerms array
  const resetGameWithCustom = () => {
    // Use existing customTerms as the source deck for the game
    resetGameWith(customTerms);
  };

  // When the user clicks "Reveal answer", show the term for the current card
  const handleReveal = () => {
    // Set showAnswer to true so the term text appears under "Correct term:"
    setShowAnswer(true);
  };

  // Handle when the user marks whether they got the card correct or not
  const handleMark = (wasCorrect) => {
    // totalAnswered increases by one whenever they answer a card (right or wrong)
    const nextTotal = totalAnswered + 1;
    // Update totalAnswered with this new count
    setTotalAnswered(nextTotal);

    // If the user marked this card as correct
    if (wasCorrect) {
      // Increase the correct answers count by 1
      const nextCorrect = correctCount + 1;
      // Set the new correctCount
      setCorrectCount(nextCorrect);

      // Calculate a new streak as one more than the current streak
      const newStreak = streak + 1;
      // Update the streak to this new value
      setStreak(newStreak);
      // Update bestStreak if this new streak is the highest so far
      setBestStreak(Math.max(bestStreak, newStreak));
    } else {
      // If the user got it wrong, reset the streak to zero
      setStreak(0);
    }

    // Hide the answer again for the next card
    setShowAnswer(false);

    // Move to next card or mark as done
    // If we are not at the last card move up the current index
    if (currentIndex + 1 < terms.length) {
      // Move to the next card in the deck
      setCurrentIndex(currentIndex + 1);
    } else {
      // If we just answered the last card game is done
      setCompleted(true);
    }
  };

  // Allow the user to restart practice with the same custom terms deck but reorganized
  const handleRestart = () => {
    // Fully reset game state using the current customTerms array
    resetGameWithCustom();
  };

  //  Add a new custom flashcard
  const handleAddCustomTerm = (e) => {
    // Prevent the form from actually submitting and reloading the page
    e.preventDefault();
    // If either term or definition is empty or whitespace, do nothing
    if (!newTerm.trim() || !newDefinition.trim())
      {
         return;
      }

    // Create a new array of custom terms by appending the new card
    const updated = [
      ...customTerms,
      {
        // Store the trimmed term text
        term: newTerm.trim(),
        // Store the trimmed definition text
        definition: newDefinition.trim(),
      },
    ];
    // Update the state with the new array of custom flashcards
    setCustomTerms(updated);
    // Clear the term input field
    setNewTerm("");
    // Clear the definition textarea
    setNewDefinition("");

    // If no active deck yet start game with new one 
    if (!terms.length) 
      {
      // If we weren't already studying from a deck make one from terms
      resetGameWith(updated);
    }
  };

  // Delete a single card by index 
  const handleDeleteCard = (indexToDelete) => {
    // Filter out the card at the index
    const updated = customTerms.filter((_, i) => i !== indexToDelete);
    // Update our custom terms with this card removed
    setCustomTerms(updated);
    // Any delete reshuffles and restarts game with remaining cards
    resetGameWith(updated);
  };

  // ui of the page
  return (
    // drawing
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 px-4">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-1">
        Term Practice – Custom Flashcards
      </h1>

      {/* Warning box letting users know the cards are temporary */}
      <div className="mt-3 mb-4 w-full max-w-md bg-amber-500/10 border border-amber-500/40 text-amber-300 text-sm px-4 py-3 rounded-lg text-center font-medium tracking-wide">
        {/* The warning text */}
        ⚠️ Your flashcards are temporary and will NOT be saved after refreshing or leaving this page.
      </div>

      {/* instructions */}
      <p className="text-sm text-slate-400 mb-4 text-center max-w-md">
        Make your own flashcards for any class. Add terms and definitions below,
        then quiz yourself with reveal + right/wrong tracking. Delete cards
        anytime if you don’t need them anymore.
      </p>

      {/* Stats / Progress */}
      {hasDeck && (
        // score/streak and progress bar 
        <div className="w-full max-w-md mb-4">
          {/* score on left streak on right */}
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            {/* Score */}
            <span>
              Score:{" "}
              <span className="text-emerald-400 font-semibold">
                {correctCount}
              </span>{" "}
              / {terms.length}
            </span>
            {/* Streak */}
            <span>
              Streak:{" "}
              <span className="text-amber-300 font-semibold">
                {streak}
              </span>{" "}
              (Best: {bestStreak})
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            {/* Actual filled bar showing percentage progress */}
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* game area */}
      <div className="w-full max-w-lg bg-slate-900/70 border border-slate-700 rounded-2xl p-5 shadow-lg shadow-black/40 mb-4">
        {/* If we don't have any cards show a no flashcards yet  */}
        {!hasDeck ? (
          // Centered text explaining user needs to add cards to begin
          <div className="text-center space-y-3">
            {/* empty state  */}
            <h2 className="text-sm font-semibold">
              No flashcards yet 🃏
            </h2>
            {/* instructions to add at least one card */}
            <p className="text-sm text-slate-300">
              Add at least one term and definition below, then your custom deck
              will appear here so you can start practicing.
            </p>
          </div>
        ) : completed ? (
          // If the game is completed, show summary and restart option
          <div className="text-center space-y-4">
            {/* Completion message */}
            <h2 className="text-lg font-semibold mb-1">
              Nice work! 🎉
            </h2>
            {/* Summary of score */}
            <p className="text-sm text-slate-300">
              You got{" "}
              <span className="font-bold text-emerald-400">
                {correctCount}
              </span>{" "}
              out of{" "}
              <span className="font-bold">
                {terms.length}
              </span>{" "}
              terms correct.
            </p>
            {/* Show best streak achieved */}
            <p className="text-xs text-slate-400">
              Best streak:{" "}
              <span className="font-semibold text-amber-300">
                {bestStreak}
              </span>
            </p>
            {/* Button to restart with the same deck */}
            <button
              onClick={handleRestart}
              className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-full bg-indigo-500 hover:bg-indigo-400 text-xs font-semibold shadow-md"
            >
              Restart practice
            </button>
          </div>
        ) : (
          // main game interface there is a deck
          <>
            {/*  Definition first label*/}
            <div className="flex justify-between items-center mb-3 text-xs text-slate-400">
              {/* Shows current card number out of total */}
              <span>
                Card {currentIndex + 1} of {terms.length}
              </span>
              {/* definition side is shown first */}
              <span className="uppercase tracking-wide">
                Definition first
              </span>
            </div>

            {/* definition box */}
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 mb-4 min-h-[170px] w-full max-w-xl mx-auto">
              {/* The actual definition text of the current card */}
              <p className="text-base text-slate-100 leading-relaxed whitespace-pre-wrap">
                {currentCard?.definition}
              </p>
            </div>

            {/* Answer section */}
            <div className="mb-4 min-h-[100px] flex items-center justify-center">
              {/* If the user clicked Reveal, show the correct term */}
              {showAnswer ? (
                // answer display
                <div className="text-center">
                  {/* label above the term */}
                  <p className="text-xs uppercase text-slate-400 mb-1">
                    Correct term:
                  </p>
                  {/* The term text itself */}
                  <p className="text-lg font-semibold text-emerald-400">
                    {currentCard?.term}
                  </p>
                </div>
              ) : (
                // show instruction text for user
                <p className="text-xs text-slate-400 text-center">
                  Try to recall the term in your head, then reveal the answer.
                </p>
              )}
            </div>

            {/* Controls */}
            {/* show a Reveal answer button if no answer yet */}
            {!showAnswer ? (
              <button
                onClick={handleReveal}
                className="w-full mb-2 py-2.5 rounded-full bg-indigo-500 hover:bg-indigo-400 text-xs font-semibold shadow-md"
              >
                Reveal answer
              </button>
            ) : (
              // show buttons for Right/Wrong
              <div className="flex gap-3">
                {/* Button for I got it right */}
                <button
                  onClick={() => handleMark(true)}
                  className="flex-1 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-xs font-semibold shadow-md"
                >
                  I got it right ✅
                </button>
                {/* Button for I got it wrong */}
                <button
                  onClick={() => handleMark(false)}
                  className="flex-1 py-2.5 rounded-full bg-rose-500 hover:bg-rose-400 text-xs font-semibold shadow-md"
                >
                  I got it wrong ❌
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom flashcards editor */}
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-4">
        {/*  explaining this section */}
        <p className="text-xs text-slate-400 mb-2">
          Build your own flashcard set for any class or exam.
        </p>
        {/* Form to add new term  */}
        <form
          onSubmit={handleAddCustomTerm}
          className="space-y-2 text-xs"
        >
          {/* Term input group */}
          <div>
            {/* Label for the term input */}
            <label className="block mb-1 text-slate-300">Term</label>
            {/* Text input where the user types the term */}
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-indigo-400"
              placeholder="e.g. Glycolysis"
            />
          </div>
          {/* Definition group */}
          <div>
            {/* Label for the definition  */}
            <label className="block mb-1 text-slate-300">
              Definition
            </label>
            {/*  where the user types the definition */}
            <textarea
              value={newDefinition}
              onChange={(e) => setNewDefinition(e.target.value)}
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-indigo-400 min-h-[60px]"
              placeholder="Short explanation you want to remember."
            />
          </div>
          {/* Row with Add button and count of custom cards */}
          <div className="flex items-center justify-between mt-2">
            {/* Submit button to add a new card */}
            <button
              type="submit"
              className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-100"
            >
              + Add card
            </button>
            {/* Display how many custom cards exist */}
            <span className="text-xs text-slate-500">
              Custom cards:{" "}
              <span className="text-slate-200 font-semibold">
                {customTerms.length}
              </span>
            </span>
          </div>
        </form>
      </div>

      {/* Existing cards list and delete buttons */}
      {customTerms.length > 0 && (
        // box that lists all existing custom cards with delete buttons
        <div className="w-full max-w-md bg-slate-900/40 border border-slate-800 rounded-2xl p-4 mb-2">
          {/* caption above the list */}
          <p className="text-xs text-slate-400 mb-2">
            Your cards (delete ones you no longer need):
          </p>
          {/*  list of cards */}
          <ul className="space-y-2 max-h-40 overflow-y-auto text-xs">
            {/*  render each card summary with delete action */}
            {customTerms.map((card, index) => (
              <li
                key={index}
                className="flex items-start justify-between gap-2 border-b border-slate-800/70 pb-2 last:border-b-0"
              >
                {/* Text content for each card */}
                <div className="min-w-0">
                  {/* The term title truncate if too big */}
                  <p className="font-semibold text-slate-100 truncate">
                    {card.term}
                  </p>
                  {/* The definition text */}
                  <p className="text-slate-400 text-xs break-words">
                    {card.definition}
                  </p>
                </div>
                {/* Delete button for this specific card */}
                <button
                  type="button"
                  onClick={() => handleDeleteCard(index)}
                  className="flex-shrink-0 px-2 py-1 rounded-full border border-rose-500/60 text-rose-300 text-[10px] hover:bg-rose-500/10"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation back to Messages page */}
      <Link
        href="/messages"
        className="mt-2 text-xs px-4 py-2 rounded-full border border-slate-600 hover:bg-slate-900"
      >
        ⬅ Back to messages
      </Link>
    </div>
  );
}
