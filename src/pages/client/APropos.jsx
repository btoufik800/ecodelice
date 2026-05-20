export default function APropos() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1 className="section-title">À propos d'<span className="accent">ÉcoDélices</span></h1>
          <p className="section-subtitle">Notre histoire, nos valeurs, nos engagements</p>
        </div>

        <div className="profile-card">
          <h3>🌱 Notre mission</h3>
          <p>
            Fondée en 2018 par une famille passionnée d'agriculture biologique, ÉcoDélices est née
            d'une envie simple : faire redécouvrir le vrai goût des fruits du Québec.
            Nous fabriquons chaque pot à la main, en petite quantité, avec des fruits cueillis à
            maturité dans des vergers certifiés bio à moins de 100 km de notre atelier.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
          <ValueBox icon="🌿" title="Biologique" desc="Nos fruits sont 100% certifiés bio, sans pesticides, sans OGM, sans additifs." />
          <ValueBox icon="🤝" title="Local" desc="Nous soutenons l'économie québécoise en travaillant exclusivement avec des producteurs locaux." />
          <ValueBox icon="♻️" title="Durable" desc="Emballages recyclables, énergie verte, compensation carbone de nos livraisons." />
        </div>

        <div className="profile-card" style={{ marginTop: '2rem' }}>
          <h3>🏆 Nos engagements</h3>
          <ul style={{ lineHeight: 1.8 }}>
            <li>✅ Tous nos fruits proviennent d'agriculteurs certifiés Ecocert.</li>
            <li>✅ Aucun colorant, conservateur ou arôme artificiel dans nos confitures.</li>
            <li>✅ Emballages en verre 100% recyclables.</li>
            <li>✅ Programme de retour et consigne sur les pots.</li>
            <li>✅ 1% du chiffre d'affaires reversé à des associations environnementales.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

const ValueBox = ({ icon, title, desc }) => (
  <div className="feature-item">
    <div className="feature-icon">{icon}</div>
    <div className="feature-title">{title}</div>
    <div className="feature-desc">{desc}</div>
  </div>
);
