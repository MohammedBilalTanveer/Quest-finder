import QuestCard from "./QuestCard.jsx";

export default function QuestList({ quests, selectedId, done, onSelect, onToggleDone }) {
  return (
    <ul className="list">
      {quests.map((q) => (
        <QuestCard
          key={q.id}
          quest={q}
          selected={q.id === selectedId}
          isDone={Boolean(done[q.id])}
          onSelect={onSelect}
          onToggleDone={onToggleDone}
        />
      ))}
    </ul>
  );
}
