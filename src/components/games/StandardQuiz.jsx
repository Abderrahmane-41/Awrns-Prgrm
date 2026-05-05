import React, { useState } from 'react';

const StandardQuiz = ({ data, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const question = data.questions[currentQuestion];

  const handleOptionClick = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === question.correctAnswer) setScore(score + 1);
  };

  const handleNext = () => {
    if (currentQuestion + 1 < data.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      const finalPercentage = Math.round(((score + (selectedOption === question.correctAnswer ? 1 : 0)) / data.questions.length) * 100);
      onComplete(finalPercentage, finalPercentage >= 70);
    }
  };

  return (
    <div className="quiz-card">
      <h2 className="quiz-question">{question.question}</h2>
      <div className="quiz-options">
        {question.options.map((opt, idx) => {
          let btnClass = "quiz-option-btn";
          if (isAnswered) {
            if (idx === question.correctAnswer) btnClass += " correct";
            else if (idx === selectedOption) btnClass += " wrong";
          }
          return (
            <button key={idx} className={btnClass} onClick={() => handleOptionClick(idx)} disabled={isAnswered}>
              {opt}
            </button>
          );
        })}
      </div>
      
      {isAnswered && (
        <div className="quiz-explanation">
          <strong>Explanation:</strong> {question.explanation}
          <button className="quiz-next-btn" onClick={handleNext}>
            {currentQuestion + 1 < data.questions.length ? 'Next Question' : 'Finish Scenario'}
          </button>
        </div>
      )}
    </div>
  );
};
export default StandardQuiz;
