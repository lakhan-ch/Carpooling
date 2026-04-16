import { Link } from 'react-router-dom';

const footerLinks = {
  PRODUCT: [
    { label: 'Find a ride', to: '/rides?mode=search' },
    { label: 'Offer a ride', to: '/create-ride' },
    { label: 'How it works', to: '/#how-it-works' },
    { label: 'Pricing', to: '/#pricing' },
    { label: 'Safety', to: '/#safety' },
  ],
  COMPANY: [
    { label: 'About us', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'Careers', to: '/careers' },
    { label: 'Press', to: '/press' },
  ],
  SUPPORT: [
    { label: 'Help center', to: '/help' },
    { label: 'Contact us', to: '/contact' },
    { label: 'Community', to: '/community' },
    { label: 'Compliance', to: '/compliance' },
  ],
};

const socialLinks = [
  { label: 'LinkedIn', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'Twitter / X', href: '#' },
  { label: 'Facebook', href: '#' },
];

export default function Footer() {
  return (
    <footer style={{ background: '#0a0a0a', color: '#fff' }}>
      {/* ── Top link grid ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                {group}
              </p>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to}
                      style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.75)', fontWeight: 400, textDecoration: 'none', display: 'inline-block', transition: 'color 0.18s ease' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Follow us */}
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              FOLLOW US
            </p>
            <ul className="space-y-3">
              {socialLinks.map(s => (
                <li key={s.label}>
                  <a href={s.href}
                    style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.75)', fontWeight: 400, textDecoration: 'none', display: 'inline-block', transition: 'color 0.18s ease' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact row */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 pt-10"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              PARTNERSHIP INQUIRIES
            </p>
            <a href="mailto:hello@carma.in"
              style={{ fontSize: '1rem', color: '#fff', fontWeight: 400, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
              hello@carma.in
            </a>
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              PRESS INQUIRIES
            </p>
            <a href="mailto:press@carma.in"
              style={{ fontSize: '1rem', color: '#fff', fontWeight: 400, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
              press@carma.in
            </a>
          </div>
        </div>
      </div>

      {/* ── Giant wordmark (Bending Spoons style) ── */}
      <div className="overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-8 pb-2">
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(5rem, 18vw, 18rem)',
            fontWeight: 900,
            lineHeight: 0.88,
            letterSpacing: '-0.04em',
            color: '#fff',
            userSelect: 'none',
          }}>
            Carma
          </p>
        </div>

        {/* Bottom legal bar */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, maxWidth: '500px' }}>
            © 2026 Carma Technologies Pvt. Ltd. · Safer rides, together. · Privacy-first carpooling platform for India.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy policy', 'Terms of service', 'Cookie preferences'].map(label => (
              <a key={label} href="#"
                style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
