// Generic image + title card used for the variety and age selection steps
// (e.g. Jaya / Narmada, New / Old).
export default function OptionCard({ image, label, onClick }) {
  return (
    <button className="option-card" onClick={onClick}>
      <div className="option-card-img">
        <img src={image} alt={label} loading="lazy" />
      </div>
      <div className="option-card-body">
        <h3>{label}</h3>
      </div>
    </button>
  );
}
