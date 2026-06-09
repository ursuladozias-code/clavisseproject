'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Menu, X, LayoutDashboard, Building2, Users, FileText, Receipt, FileCheck, Shield, UserCircle, Settings, Zap, TrendingUp, FileSearch, Home, CreditCard } from 'lucide-react'

const mainLinks = [
  { href: '/',                  label: 'Dashboard',                  icon: LayoutDashboard },
  { href: '/biens',             label: 'Mes biens',                  icon: Building2 },
  { href: '/locataires',        label: 'Locataires',                 icon: Users },
  { href: '/baux',              label: 'Baux',                       icon: FileText },
  { href: '/depot-garantie',    label: 'Dépôts de garantie',         icon: Shield },
  { href: '/quittances',        label: 'Quittances',                 icon: FileCheck },
  { href: '/indexation',        label: 'Indexation des loyers',      icon: TrendingUp },
  { href: '/regularisation',    label: 'Régularisation des charges', icon: Receipt },
  { href: '/etats-des-lieux',   label: 'États des lieux',            icon: FileSearch },
  { href: '/comptabilite',          label: 'Comptabilité',                   icon: CreditCard },
  { href: '/espace-locataire',  label: 'Espace locataire',           icon: Home },
]

const bottomLinks = [
  { href: '/profil',   label: 'Mon profil propriétaire', icon: UserCircle },
  { href: '/reglages', label: 'Réglages',                icon: Settings },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string
    label: string
    icon: any
  }) => {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative"
        style={
          isActive
            ? {
                background:
                  'linear-gradient(135deg, rgba(249,115,22,0.25), rgba(251,191,36,0.15))',
                border: '1px solid rgba(251,191,36,0.3)',
              }
            : { border: '1px solid transparent' }
        }
      >
        {/* Icône */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
          style={
            isActive
              ? {
                  background: 'linear-gradient(135deg, #F97316, #FBBF24)',
                  boxShadow: '0 4px 12px rgba(249,115,22,0.4)',
                }
              : { background: 'rgba(255,255,255,0.05)' }
          }
        >
          <Icon
            size={15}
            style={{ color: isActive ? '#fff' : '#A07840' }}
            className="group-hover:text-amber-300 transition-colors"
          />
        </div>

        {/* Label */}
        <span
          className="text-sm font-medium leading-tight transition-colors group-hover:text-amber-200"
          style={{ color: isActive ? '#FDE68A' : '#C4965A' }}
        >
          {label}
        </span>

        {/* Point actif */}
        {isActive && (
          <div
            className="absolute right-3 w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: '#FBBF24', boxShadow: '0 0 6px #FBBF24' }}
          />
        )}
      </Link>
    )
  }

  return (
    <>
      {/* Bouton hamburger — mobile uniquement */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl shadow-lg text-white"
        style={{ background: 'linear-gradient(135deg, #F97316, #FBBF24)' }}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay mobile */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-40 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}
        style={{
          background:
            'linear-gradient(180deg, #1C1A14 0%, #2D2416 50%, #1C1A14 100%)',
          borderRight: '1px solid rgba(251, 191, 36, 0.15)',
        }}
      >
        {/* Halo haut */}
        <div
          className="absolute top-0 left-0 right-0 h-32 opacity-20 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, #FBBF24 0%, transparent 70%)',
          }}
        />

        {/* ── LOGO ── */}
        <div className="px-6 pt-8 pb-6 relative flex-shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F97316, #FBBF24)' }}
            >
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              CLAVISSE
            </span>
          </div>
          <p className="text-xs ml-12" style={{ color: '#6B5020' }}>
            Gestion locative
          </p>
        </div>

        {/* Séparateur */}
        <div
          className="mx-5 mb-4 h-px flex-shrink-0"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(251,191,36,0.2), transparent)',
          }}
        />

        {/* ── MENU PRINCIPAL ── */}
        <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
          {/* Label section */}
          <p
            className="text-xs font-semibold uppercase tracking-widest px-3 mb-2"
            style={{ color: '#4A3520' }}
          >
            Menu principal
          </p>

          {mainLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        {/* Séparateur bas */}
        <div
          className="mx-5 mt-4 mb-4 h-px flex-shrink-0"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(251,191,36,0.2), transparent)',
          }}
        />

        {/* ── MENU BAS ── */}
        <div className="px-3 flex flex-col gap-1 flex-shrink-0">
          <p
            className="text-xs font-semibold uppercase tracking-widest px-3 mb-2"
            style={{ color: '#4A3520' }}
          >
            Compte
          </p>

          {bottomLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </div>

        {/* ── BADGE UTILISATEUR ── */}
        <div className="px-4 py-4 flex-shrink-0">
          <div
            className="p-3 rounded-xl flex items-center gap-3"
            style={{
              background:
                'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(251,191,36,0.08))',
              border: '1px solid rgba(251,191,36,0.15)',
            }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F97316, #FBBF24)' }}
            >
              JD
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-amber-200 truncate">
                Jean Dupont
              </p>
              <p className="text-xs truncate" style={{ color: '#6B5020' }}>
                Pro · 3 biens
              </p>
            </div>
            {/* Indicateur en ligne */}
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: '#22C55E',
                boxShadow: '0 0 6px #22C55E',
              }}
            />
          </div>
        </div>
      </aside>
    </>
  )
}
