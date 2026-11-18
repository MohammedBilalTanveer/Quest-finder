import QuestCard from "./QuestCard.jsx";

export default function QuestList({ quests, selectedId, onSelect }) {
  return (
    <ul className="list">
      {quests.map((q) => (
        <QuestCard key={q.id} quest={q} selected={q.id === selectedId} onSelect={onSelect} />
      ))}
    </ul>
  );
}
