import { useState } from 'react';
import Icon from './Icon.jsx';
import { toast } from '../lib/toast.js';

const FORMULA_DATA = {
  physics: [
    {
      category: 'Dynamic Electricity',
      icon: 'bolt',
      items: [
        { name: "Ohm's Law", formula: 'V = I · R', desc: 'Potential difference = Current × Resistance' },
        { name: 'Electrical Resistance', formula: 'R = ρ_e · (L / A) = L / (σ · A)', desc: 'ρ_e = resistivity, σ = conductivity, L = length, A = area' },
        { name: 'Electric Energy & Power', formula: 'P_w = V · I = I² · R = V² / R', desc: 'Energy W = P_w · t = V · I · t (Joules)' },
        { name: "Kirchhoff's 1st Law (KCL)", formula: 'Σ I_in = Σ I_out', desc: 'Conservation of electric charge at any junction' },
        { name: "Kirchhoff's 2nd Law (KVL)", formula: 'Σ V_B = Σ (I · R)', desc: 'Conservation of energy in any closed loop' },
        { name: 'Internal Resistance & Terminal Voltage', formula: 'V = V_B - I · r', desc: 'V_B = battery EMF, r = internal resistance' },
      ],
    },
    {
      category: 'Electromagnetism',
      icon: 'magnet',
      items: [
        { name: 'Magnetic Flux', formula: 'Φ_m = B · A · sin(θ)', desc: 'B = magnetic flux density (Tesla), A = area, θ = angle with field' },
        { name: 'Magnetic Field - Straight Wire', formula: 'B = (μ · I) / (2π · d)', desc: "Ampere's Circular Law, d = perpendicular distance" },
        { name: 'Magnetic Field - Circular Coil', formula: 'B = (μ · N · I) / (2r)', desc: 'N = number of turns, r = radius of coil' },
        { name: 'Magnetic Field - Solenoid', formula: 'B = (μ · N · I) / L = μ · n · I', desc: 'L = length, n = turns per unit length (N / L)' },
        { name: 'Magnetic Force on Current Wire', formula: 'F = B · I · L · sin(θ)', desc: "Fleming's Left Hand Rule gives direction" },
        { name: 'Magnetic Torque on Coil', formula: 'τ = B · I · A · N · sin(θ_normal)', desc: 'Magnetic dipole moment m_d = I · A · N' },
      ],
    },
    {
      category: 'Electromagnetic Induction',
      icon: 'wave',
      items: [
        { name: "Faraday's Law of Induction", formula: 'emf = - N · (ΔΦ_m / Δt)', desc: "Lenz's rule gives the negative sign (opposes change)" },
        { name: 'EMF in a Moving Straight Wire', formula: 'emf = - B · L · v · sin(θ)', desc: "Fleming's Right Hand Rule for induced current direction" },
        { name: 'Mutual Induction', formula: 'emf_2 = - M · (ΔI_1 / Δt)', desc: 'M = coefficient of mutual induction (Henry)' },
        { name: 'Self Induction', formula: 'emf = - L · (ΔI / Δt)', desc: 'L = coefficient of self induction (Henry)' },
        { name: 'AC Generator (Dynamo)', formula: 'emf_inst = NABω · sin(ωt)', desc: 'ω = 2πf, emf_max = NABω, emf_eff = 0.707 · emf_max' },
        { name: 'Electric Transformer', formula: 'V_s / V_p = N_s / N_p = I_p / I_s (ideal)', desc: 'Efficiency η = (V_s · I_s) / (V_p · I_p) × 100%' },
      ],
    },
    {
      category: 'AC Circuits & Resonance',
      icon: 'wave',
      items: [
        { name: 'Inductive Reactance', formula: 'X_L = 2π · f · L = ω · L', desc: 'Current lags voltage by 90° across pure inductor' },
        { name: 'Capacitive Reactance', formula: 'X_C = 1 / (2π · f · C) = 1 / (ω · C)', desc: 'Current leads voltage by 90° across pure capacitor' },
        { name: 'Total Impedance (RLC)', formula: 'Z = √[ R² + (X_L - X_C)² ]', desc: 'Phase angle: tan(θ) = (X_L - X_C) / R' },
        { name: 'Resonant Frequency', formula: 'f_0 = 1 / (2π · √(L · C))', desc: 'At resonance: X_L = X_C, Z = R (minimum), I is maximum' },
      ],
    },
    {
      category: 'Modern Physics & Dual Nature',
      icon: 'atom',
      items: [
        { name: 'Photon Energy & Momentum', formula: 'E = h · ν = (h · c) / λ ,  p_L = h / λ', desc: 'h = Planck constant, c = speed of light, ν = frequency' },
        { name: "Einstein's Photoelectric Equation", formula: 'E_k(max) = h · ν - E_w = ½ · m_e · v_max²', desc: 'E_w = work function = h · ν_c (critical frequency)' },
        { name: 'de Broglie Wavelength', formula: 'λ = h / (m · v) = h / p_L', desc: 'Wave-particle duality for any moving particle' },
        { name: "Compton's Effect Relation", formula: 'Δλ = λ\' - λ = (h / m_e c) · (1 - cos θ)', desc: 'Confirms particle nature of photons' },
      ],
    },
    {
      category: 'Key Physical Constants',
      icon: 'sparkles',
      items: [
        { name: 'Speed of Light in Vacuum', formula: 'c = 3.00 × 10⁸ m/s', desc: 'Universal physical constant' },
        { name: "Planck's Constant", formula: 'h = 6.625 × 10⁻³⁴ J · s', desc: 'Quantum action constant' },
        { name: 'Elementary Electron Charge', formula: 'e = 1.602 × 10⁻¹⁹ C', desc: 'Charge of single electron / proton' },
        { name: 'Electron Rest Mass', formula: 'm_e = 9.109 × 10⁻³¹ kg', desc: 'Rest mass of electron' },
        { name: 'Permeability of Free Space', formula: 'μ_0 = 4π × 10⁻⁷ T · m/A (≈ 1.256 × 10⁻⁶)', desc: 'Magnetic constant' },
      ],
    },
  ],
  math: [
    {
      category: 'Algebra & Combinatorics',
      icon: 'sigma',
      items: [
        { name: 'Permutations & Combinations', formula: 'ⁿP_r = n! / (n-r)! ,  ⁿC_r = n! / [r! · (n-r)!]', desc: 'ⁿC_r = ⁿP_r / r! ,  ⁿC_r = ⁿC_(n-r)' },
        { name: 'Combinations Addition Rule', formula: 'ⁿC_r + ⁿC_(r-1) = ⁿ⁺¹C_r', desc: 'Pascal identity for combinatorics' },
        { name: 'Combinations Ratio Rule', formula: 'ⁿC_r / ⁿC_(r-1) = (n - r + 1) / r', desc: 'Quick simplification for adjacent combinations' },
        { name: 'Binomial Theorem General Term', formula: 'T_(r+1) = ⁿC_r · x^(n-r) · a^r', desc: 'In expansion of (x + a)ⁿ' },
        { name: 'Binomial Ratio of Consecutive Terms', formula: 'T_(r+1) / T_r = [(n - r + 1) / r] · (a / x)', desc: 'Crucial for greatest term problems' },
      ],
    },
    {
      category: 'Complex Numbers',
      icon: 'atom',
      items: [
        { name: 'Trigonometric & Exponential Forms', formula: 'z = r(cos θ + i sin θ) = r · e^(iθ)', desc: 'Modulus r = √(x² + y²), Amplitude θ = arctan(y/x)' },
        { name: "De Moivre's Theorem", formula: 'zⁿ = rⁿ · [cos(nθ) + i sin(nθ)]', desc: 'For nth powers and roots' },
        { name: 'nth Roots of a Complex Number', formula: 'z^(1/n) = r^(1/n) · [cos((θ + 2kπ)/n) + i sin((θ + 2kπ)/n)]', desc: 'k = 0, 1, 2, ..., n-1' },
        { name: 'Cubic Roots of Unity (ω)', formula: '1 + ω + ω² = 0 ,  ω³ = 1', desc: 'ω - ω² = ±√3 i ,  1/ω = ω² ,  1/ω² = ω' },
      ],
    },
    {
      category: 'Solid Geometry & 3D Vectors',
      icon: 'calc',
      items: [
        { name: '3D Distance Formula', formula: 'd = √[ (x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)² ]', desc: 'Distance between two points in 3D' },
        { name: 'Dot (Scalar) Product', formula: 'A · B = ||A|| · ||B|| · cos(θ) = A_x B_x + A_y B_y + A_z B_z', desc: 'Perpendicular test: A · B = 0' },
        { name: 'Cross (Vector) Product', formula: 'A × B = ||A|| · ||B|| · sin(θ) · n̂', desc: 'Parallel test: A × B = 0 or A_x/B_x = A_y/B_y = A_z/B_z' },
        { name: 'Equation of a Sphere', formula: '(x - a)² + (y - b)² + (z - c)² = R²', desc: 'Center M(a, b, c), Radius R' },
        { name: 'Vector Equation of a Line', formula: 'r = A + t · d', desc: 'A = known point, d = direction vector (l, m, n)' },
        { name: 'Equation of a Plane', formula: 'n · r = n · A   or   a x + b y + c z = d', desc: 'n = normal vector (a, b, c), A = point on plane' },
      ],
    },
  ],
};

function renderFormula(formula) {
  if (!formula) return null;
  const parts = formula.split(/(_\([^\)]+\)|_\{[^}]+\}|_[A-Za-z0-9]+|\^\([^\)]+\)|\^\{[^}]+\}|\^[A-Za-z0-9]+)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('_')) {
      const clean = part.slice(1).replace(/^[\({](.*)[\)}]$/, '$1');
      return <sub key={idx}>{clean}</sub>;
    }
    if (part.startsWith('^')) {
      const clean = part.slice(1).replace(/^[\({](.*)[\)}]$/, '$1');
      return <sup key={idx}>{clean}</sup>;
    }
    return part;
  });
}

export default function FormulaModal({ onClose }) {
  const [tab, setTab] = useState('physics'); // 'physics' | 'math'
  const [query, setQuery] = useState('');
  const [copiedFormula, setCopiedFormula] = useState(null);

  const categories = FORMULA_DATA[tab] || [];
  const q = query.trim().toLowerCase();

  const filtered = categories.map((cat) => {
    const matchedItems = cat.items.filter((item) =>
      !q || item.name.toLowerCase().includes(q) || item.formula.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || cat.category.toLowerCase().includes(q)
    );
    return { ...cat, items: matchedItems };
  }).filter((cat) => cat.items.length > 0);

  const copy = (formula) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(formula);
      setCopiedFormula(formula);
      toast('Formula copied.');
      setTimeout(() => setCopiedFormula(null), 1500);
    }
  };

  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet formula-sheet" style={{ maxWidth: 760, maxHeight: '88vh' }}>
        {/* Header - Organic, Clean, Non-Boxy */}
        <div className="fm-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="fm-circle-icon">
              <Icon name="formula" size={20} stroke={2.4} />
            </span>
            <div>
              <h2 className="h2" style={{ margin: 0, fontSize: 21 }}>Formulas & Reference Sheet</h2>
              <span className="small">High-yield physics laws, physical constants & mathematics relations</span>
            </div>
          </div>
          <button className="ib" onClick={onClose} aria-label="Close formula sheet">
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="fm-tabs">
          <button
            className={`fm-tab-pill ${tab === 'physics' ? 'active' : ''}`}
            onClick={() => setTab('physics')}
          >
            <Icon name="bolt" size={15} /> Physics Formulas & Constants
          </button>
          <button
            className={`fm-tab-pill ${tab === 'math' ? 'active' : ''}`}
            onClick={() => setTab('math')}
          >
            <Icon name="sigma" size={15} /> Math 1 & 2 Relations
          </button>
        </div>

        {/* Search */}
        <input
          type="search"
          className="fm-search-input"
          placeholder={`Search ${tab === 'physics' ? 'Physics' : 'Math'} formulas, laws or constants... (e.g. Ohm, Kirchhoff, De Moivre)`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        {/* List of Formulas - Fluid, Borderless, Non-Boxy */}
        <div className="fm-list">
          {filtered.length === 0 ? (
            <div className="empty" style={{ margin: '14px 0', border: '0', background: 'transparent' }}>
              <p className="lead">No formulas matching “{query}”</p>
              <button className="btn sm line" onClick={() => setQuery('')} style={{ marginTop: 10 }}>Clear search</button>
            </div>
          ) : (
            filtered.map((cat) => (
              <section key={cat.category} className="fm-section">
                <div className="fm-section-header">
                  <span className="fm-section-icon"><Icon name={cat.icon || 'formula'} size={16} /></span>
                  <h3 className="fm-section-title">{cat.category}</h3>
                  <span className="small">({cat.items.length})</span>
                </div>

                <div className="fm-items-grid">
                  {cat.items.map((item, idx) => (
                    <div key={idx} className="fm-row">
                      <div className="fm-row-left">
                        <b className="fm-item-name">{item.name}</b>
                        <div className="fm-formula-text">
                          {renderFormula(item.formula)}
                        </div>
                        <span className="small fm-item-desc">{item.desc}</span>
                      </div>
                      <button
                        className={`btn sm fm-copy-pill ${copiedFormula === item.formula ? 'copied' : ''}`}
                        onClick={() => copy(item.formula)}
                        title="Copy formula"
                      >
                        <Icon name={copiedFormula === item.formula ? 'check' : 'copy'} size={13} />
                        <span>{copiedFormula === item.formula ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
