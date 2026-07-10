import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, Wallet, Sun, Moon, UserPlus, Trash2, Plus, Edit2, CheckSquare, LogOut, Lock, Eye } from 'lucide-react';
import { supabase } from './lib/supabase';

// Auth constants
const ADMIN_PASSWORD = 'PiuPiu123';
const MEMBER_PASSWORD = 'Passarocos';
type Role = 'admin' | 'member';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [role, setRole] = useState<Role | null>(() => {
    return (localStorage.getItem('pm_role') as Role | null);
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogin = (r: Role) => {
    localStorage.setItem('pm_role', r);
    setRole(r);
  };

  const handleLogout = () => {
    localStorage.removeItem('pm_role');
    setRole(null);
  };

  if (!role) {
    return <LoginScreen theme={theme} toggleTheme={toggleTheme} onLogin={handleLogin} />;
  }

  const isAdmin = role === 'admin';

  return (
    <BrowserRouter>
      <div className={`app-container ${theme}`}>
        <header className="app-header">
          <div className="header-top">
            <button onClick={handleLogout} className="theme-toggle" aria-label="Sair" title="Terminar sessão">
              <LogOut size={20} color="var(--color-header-text)" />
            </button>
            <img src="/logo.jpg.jpg" alt="Passarinhos do Mondego Logo" className="app-logo" />
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Alternar tema">
              {theme === 'light' ? <Moon size={24} color="var(--color-header-text)" /> : <Sun size={24} color="var(--color-header-text)" />}
            </button>
          </div>
          <h1>Passarinhos do Mondego</h1>
          {!isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
              <Eye size={12} color="var(--color-header-text)" style={{ opacity: 0.7 }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-header-text)', opacity: 0.7 }}>Modo Visualização</span>
            </div>
          )}
        </header>

        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard isAdmin={isAdmin} />} />
            <Route path="/members" element={<Members isAdmin={isAdmin} />} />
            <Route path="/events" element={<Events isAdmin={isAdmin} />} />
            <Route path="/payments" element={<Payments isAdmin={isAdmin} />} />
          </Routes>
        </main>

        <nav className="bottom-nav">
          <NavLink to="/" icon={<LayoutDashboard />} label="Início" />
          <NavLink to="/members" icon={<Users />} label="Passarinhos" />
          <NavLink to="/events" icon={<CalendarDays />} label="Almoços" />
          <NavLink to="/payments" icon={<Wallet />} label="Cotas" />
        </nav>
      </div>
    </BrowserRouter>
  );
}

function NavLink({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`}>
      <div className="nav-icon">{icon}</div>
      <span>{label}</span>
    </Link>
  );
}

// Types
type MemberLocal = {
  id: string;
  name: string;
  join_date: string;
};

type EventLocal = {
  id: string;
  restaurant_name: string;
  date: string;
  notes: string;
  participant_ids: string[];
  absent_ids?: string[];
};

type PaymentLocal = {
  id: string;
  member_id: string;
  amount: number;
  payment_date: string;
  notes: string;
  created_at: string;
};

type ExpenseLocal = {
  id: string;
  amount: number;
  expense_date: string;
  description: string;
  created_at: string;
};

// Login Screen
function LoginScreen({ theme, toggleTheme, onLogin }: {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogin: (role: Role) => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin('admin');
    } else if (password === MEMBER_PASSWORD) {
      onLogin('member');
    } else {
      setError('Senha incorreta. Tente novamente.');
      setPassword('');
    }
  };

  return (
    <div className={`app-container ${theme}`} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="app-header">
        <div className="header-top">
          <div className="header-spacer"></div>
          <img src="/logo.jpg.jpg" alt="Passarinhos do Mondego Logo" className="app-logo" />
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Alternar tema">
            {theme === 'light' ? <Moon size={24} color="var(--color-header-text)" /> : <Sun size={24} color="var(--color-header-text)" />}
          </button>
        </div>
        <h1>Passarinhos do Mondego</h1>
      </header>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '360px', padding: '32px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'var(--color-primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <Lock size={28} color="white" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>Bem-vindo!</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Introduza a sua senha para entrar</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type={show ? 'text' : 'password'}
                placeholder="Senha de acesso"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className="input-field"
                autoFocus
                style={{ paddingRight: '44px', letterSpacing: show ? 'normal' : '4px', fontSize: show ? '1rem' : '1.2rem' }}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0 }}
              >
                <Eye size={18} />
              </button>
            </div>

            {error && (
              <p style={{ color: 'var(--color-primary)', fontSize: '0.85rem', textAlign: 'center', margin: '-4px 0' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '14px', fontSize: '1rem', fontWeight: 600 }}
              disabled={!password}
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Components
function Dashboard({ isAdmin: _isAdmin }: { isAdmin: boolean }) {
  const [nextEvent, setNextEvent] = useState<EventLocal | null>(null);
  const [members, setMembers] = useState<MemberLocal[]>([]);
  const [showConfirmed, setShowConfirmed] = useState(false);
  const [managingAttendance, setManagingAttendance] = useState(false);
  const [totalFund, setTotalFund] = useState<number | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    fetchDashboardData();
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      const isIosDevice = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
      if (isIosDevice) {
        setShowIOSPrompt(true);
      } else {
        alert("Para instalar esta app no ecrã inicial:\nNo Android: Clique no menu do browser (3 pontinhos) e em 'Adicionar ao ecrã inicial'.\nNo iOS (Safari): Clique em Partilhar e em 'Adicionar ao ecrã principal'.");
      }
    }
  };

  async function fetchDashboardData() {
    // Fetch members
    const { data: membersData } = await supabase
      .from('members')
      .select('*');
    if (membersData) setMembers(membersData);

    // Fetch next event
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('id, restaurant_name, date, notes, participant_ids, absent_ids')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (eventError) console.error('Erro ao carregar almoço:', eventError);
    if (eventData) setNextEvent(eventData);

    // Fetch total fund from payments minus expenses
    const [{ data: paymentsData }, { data: expensesData }] = await Promise.all([
      supabase.from('payments').select('amount'),
      supabase.from('expenses').select('amount'),
    ]);
    if (paymentsData) {
      const totalIn = paymentsData.reduce((sum, p) => sum + Number(p.amount), 0) + 210;
      const totalOut = (expensesData || []).reduce((sum, e) => sum + Number(e.amount), 0);
      setTotalFund(totalIn - totalOut);
    }
  }

  const setAttendance = async (memberId: string, status: 'going' | 'absent' | 'none') => {
    if (!nextEvent) return;

    let updatedParticipants = (nextEvent.participant_ids || []).filter(id => id !== memberId);
    let updatedAbsents = (nextEvent.absent_ids || []).filter(id => id !== memberId);

    if (status === 'going') {
      updatedParticipants.push(memberId);
    } else if (status === 'absent') {
      updatedAbsents.push(memberId);
    }

    const { error } = await supabase
      .from('events')
      .update({ participant_ids: updatedParticipants, absent_ids: updatedAbsents })
      .eq('id', nextEvent.id);

    if (error) {
      console.error('Erro ao atualizar presença:', error);
      alert('Erro ao atualizar presença. O campo absent_ids pode não existir na base de dados.');
    } else {
      setNextEvent({ ...nextEvent, participant_ids: updatedParticipants, absent_ids: updatedAbsents });
    }
  };

  const getDaysLeft = (dateString: string) => {
    const now = new Date();
    const eventDateObj = new Date(dateString);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDateObj.getFullYear(), eventDateObj.getMonth(), eventDateObj.getDate());
    const diffTime = eventDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="page p-4 fade-in">
      <div className="welcome-section mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>Olá, Passarinho!</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Bem-vindo ao nosso ninho.</p>
          </div>
          {!isStandalone && (
            <button onClick={handleInstallApp} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
              Instalar App
            </button>
          )}
        </div>
        {showIOSPrompt && (
          <div style={{ marginTop: '12px', padding: '12px', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-primary)', fontSize: '0.85rem' }}>
            <strong>Para instalar no iPhone:</strong><br/>
            1. Clique no botão de partilhar (quadrado com seta para cima) na barra de navegação do Safari.<br/>
            2. Deslize para baixo e clique em "Adicionar ao ecrã principal" 📱
            <button onClick={() => setShowIOSPrompt(false)} style={{ display: 'block', marginTop: '8px', padding: '4px 8px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }}>Entendido</button>
          </div>
        )}
      </div>

      <div className="card dashboard-card bg-primary mb-4">
        <div className="card-header">
          <span>Fundo Comum</span>
          <Wallet size={20} />
        </div>
        <div className="card-body">
          <h3 className="amount" style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
            {totalFund !== null ? `${totalFund.toFixed(2)} €` : '...' }
            <span style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.9 }}>
              à data de {new Date().toLocaleDateString('pt-PT')}
            </span>
          </h3>
          <p className="subtitle">Disponível para os nossos repastos 😁</p>
        </div>
      </div>

      <div className="card next-event-card mb-4">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={20} color="var(--color-primary)" />
            <span>Próximo Almoço</span>
          </div>
          {nextEvent && (
            <span className="tag" style={{ margin: 0 }}>
              {getDaysLeft(nextEvent.date) === 0 ? 'É Hoje!' :
                getDaysLeft(nextEvent.date) === 1 ? 'Amanhã' :
                  `Faltam ${getDaysLeft(nextEvent.date)} dias`}
            </span>
          )}
        </div>
        <div className="card-body mt-3">
          {nextEvent ? (
            <>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{nextEvent.restaurant_name}</h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '8px', textTransform: 'capitalize' }}>
                {new Date(nextEvent.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} às {new Date(nextEvent.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {nextEvent.notes && (
                <div style={{ backgroundColor: 'var(--color-background)', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap', border: '1px solid var(--color-border)' }}>
                  <strong>Ementa / Notas:</strong><br />
                  {nextEvent.notes}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <div
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 8px', backgroundColor: 'var(--color-surface)', borderRadius: '6px', border: '1px solid #22c55e' }}
                  onClick={() => setShowConfirmed(!showConfirmed)}
                >
                  <Users size={14} color="#22c55e" />
                  <span style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 600 }}>
                    {nextEvent.participant_ids?.length || 0} Confirmados
                  </span>
                </div>
                <div
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 8px', backgroundColor: 'var(--color-surface)', borderRadius: '6px', border: '1px solid #ef4444' }}
                  onClick={() => setShowConfirmed(!showConfirmed)}
                >
                  <Users size={14} color="#ef4444" />
                  <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>
                    {nextEvent.absent_ids?.length || 0} Não Vão
                  </span>
                </div>
              </div>

              {showConfirmed && (
                <div className="slide-down" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(nextEvent.participant_ids?.length || 0) > 0 && (
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 500 }}>Vão ao almoço:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {nextEvent.participant_ids.map(id => {
                          const member = members.find(m => m.id === id);
                          return member ? (
                            <span key={id} style={{ backgroundColor: '#22c55e', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 500 }}>
                              {member.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  
                  {(nextEvent.absent_ids?.length || 0) > 0 && (
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 500 }}>Não podem ir:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {nextEvent.absent_ids?.map(id => {
                          const member = members.find(m => m.id === id);
                          return member ? (
                            <span key={id} style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 500 }}>
                              {member.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setManagingAttendance(!managingAttendance)}
                className="btn btn-primary mt-3"
                style={{ width: '100%', padding: '6px 12px', fontSize: '0.9rem' }}
              >
                <CheckSquare size={16} />
                {managingAttendance ? 'Fechar Confirmações' : 'Confirmar Presença'}
              </button>

              {managingAttendance && (
                <div className="attendance-panel mt-3 p-3 slide-down" style={{ backgroundColor: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <h5 style={{ fontSize: '0.95rem', marginBottom: '12px', fontWeight: 600 }}>Quem vai estar presente?</h5>
                  {members.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Não existem membros registados.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                      {[...members].sort((a, b) => a.name.localeCompare(b.name)).map(member => {
                        const isGoing = (nextEvent.participant_ids || []).includes(member.id);
                        const isAbsent = (nextEvent.absent_ids || []).includes(member.id);

                        return (
                          <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--color-border)' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{member.name}</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => setAttendance(member.id, isGoing ? 'none' : 'going')}
                                style={{
                                  padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #22c55e',
                                  backgroundColor: isGoing ? '#22c55e' : 'transparent',
                                  color: isGoing ? 'white' : '#22c55e',
                                  cursor: 'pointer'
                                }}
                              >
                                Vou
                              </button>
                              <button
                                onClick={() => setAttendance(member.id, isAbsent ? 'none' : 'absent')}
                                style={{
                                  padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #ef4444',
                                  backgroundColor: isAbsent ? '#ef4444' : 'transparent',
                                  color: isAbsent ? 'white' : '#ef4444',
                                  cursor: 'pointer'
                                }}
                              >
                                Não Vou
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Nenhum almoço marcado de momento.</p>
          )}
        </div>
      </div>

      <div className="quote-section">
        <p className="quote">"As boas memórias constroem-se à volta da mesa com grandes amigos."</p>
      </div>
    </div>
  );
}

function Members({ isAdmin }: { isAdmin: boolean }) {
  const [members, setMembers] = useState<MemberLocal[]>([]);
  const [newName, setNewName] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name', { ascending: true });

    if (error) console.error('Erro ao listar membros:', error);
    if (data) setMembers(data);
  }

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const { error } = await supabase
      .from('members')
      .insert([{ name: newName.trim() }]);

    if (error) {
      console.error('Erro ao adicionar membro:', error);
      alert('Erro ao adicionar membro: ' + error.message);
    } else {
      setNewName('');
      fetchMembers();
    }
  };

  const removeMember = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja remover este membro?')) {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover membro:', error);
        alert('Erro ao remover membro. Verifique a consola.');
      } else {
        fetchMembers();
      }
    }
  };

  const startEditing = (member: MemberLocal) => {
    setEditingId(member.id);
    setEditName(member.name);
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;

    const { error } = await supabase
      .from('members')
      .update({ name: editName.trim() })
      .eq('id', id);

    if (!error) {
      setEditingId(null);
      fetchMembers();
    }
  };

  return (
    <div className="page p-4 fade-in">
      <div className="welcome-section mb-4">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--color-primary)' }}>{members.length}</span> Passarinhos
        </h2>
      </div>

      {isAdmin && (
        <div className="card mb-4">
          <form onSubmit={addMember} className="add-member-form">
            <input
              type="text"
              placeholder="Nome do Passarinho"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="btn btn-primary" disabled={!newName.trim()}>
              <UserPlus size={20} />
              <span className="sr-only">Adicionar</span>
            </button>
          </form>
        </div>
      )}

      <div className="members-list">
        {members.length === 0 ? (
          <div className="empty-state">
            Nenhum Passarinho adicionado ainda.
          </div>
        ) : (
          members.map(member => (
            <div key={member.id} className="card member-item">
              {editingId === member.id ? (
                <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-field"
                    autoFocus
                  />
                  <button onClick={() => saveEdit(member.id)} className="btn btn-primary" style={{ padding: '8px' }}>
                    Salvar
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn" style={{ background: 'var(--color-border)', color: 'var(--color-text)', padding: '8px' }}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <div className="member-info">
                    <div className="avatar">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="member-name">{member.name}</h4>
                      <span className="member-date">Membro desde {new Date(member.join_date).toLocaleDateString('pt-PT')}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => startEditing(member)}
                        className="btn-icon"
                        aria-label="Editar membro"
                        type="button"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => removeMember(member.id)}
                        className="btn-icon btn-danger"
                        aria-label="Remover membro"
                        type="button"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Events({ isAdmin }: { isAdmin: boolean }) {
  const [events, setEvents] = useState<EventLocal[]>([]);
  const [members, setMembers] = useState<MemberLocal[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [managingAttendanceId, setManagingAttendanceId] = useState<string | null>(null);
  const [viewingAttendanceId, setViewingAttendanceId] = useState<string | null>(null);

  const [restaurant_name, setRestaurantName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchMembers();
  }, []);

  async function fetchMembers() {
    const { data } = await supabase.from('members').select('*');
    if (data) setMembers(data);
  }

  async function fetchEvents() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false });

    if (data) setEvents(data);
  }

  const resetForm = () => {
    setRestaurantName('');
    setEventDate('');
    setNotes('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant_name.trim() || !eventDate) return;

    const eventData = {
      restaurant_name: restaurant_name.trim(),
      date: new Date(eventDate).toISOString(),
      notes: notes.trim()
    };

    if (editingId) {
      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingId);

      if (error) {
        console.error('Erro ao editar almoço:', error);
        alert('Erro ao editar almoço. Verifique a consola.');
      } else {
        fetchEvents();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('events')
        .insert([eventData]);

      if (error) {
        console.error('Erro ao criar almoço:', error);
        alert('Erro ao criar almoço. Verifique a consola.');
      } else {
        fetchEvents();
        resetForm();
      }
    }
  };

  const startEditing = (event: EventLocal) => {
    setRestaurantName(event.restaurant_name);
    // Format date for datetime-local input
    const date = new Date(event.date);
    const formattedDate = date.toISOString().slice(0, 16);
    setEventDate(formattedDate);
    setNotes(event.notes);
    setEditingId(event.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeEvent = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja remover este almoço?')) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (!error) {
        if (editingId === id) resetForm();
        if (managingAttendanceId === id) setManagingAttendanceId(null);
        fetchEvents();
      }
    }
  };

  const setEventAttendance = async (eventId: string, memberId: string, status: 'going' | 'absent' | 'none') => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    let updatedParticipants = (event.participant_ids || []).filter(id => id !== memberId);
    let updatedAbsents = (event.absent_ids || []).filter(id => id !== memberId);

    if (status === 'going') {
      updatedParticipants.push(memberId);
    } else if (status === 'absent') {
      updatedAbsents.push(memberId);
    }

    const { error } = await supabase
      .from('events')
      .update({ participant_ids: updatedParticipants, absent_ids: updatedAbsents })
      .eq('id', eventId);

    if (!error) {
      setEvents(events.map(ev =>
        ev.id === eventId ? { ...ev, participant_ids: updatedParticipants, absent_ids: updatedAbsents } : ev
      ));
    } else {
      alert('Erro ao atualizar presença. O campo absent_ids pode não existir na base de dados.');
    }
  };

  const now = new Date();

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = events
    .filter(e => new Date(e.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getDaysLeft = (dateString: string) => {
    const eventDateObj = new Date(dateString);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDateObj.getFullYear(), eventDateObj.getMonth(), eventDateObj.getDate());
    const diffTime = eventDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="page p-4 fade-in">
      <div className="welcome-section mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>Almoços</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Os nossos repastos.</p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            style={{ padding: '8px 12px', fontSize: '0.9rem' }}
          >
            {showForm ? 'Cancelar' : <><Plus size={18} /> Novo</>}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-4 slide-down">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>{editingId ? 'Editar Almoço' : 'Marcar Almoço'}</h3>
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Nome do Restaurante"
              value={restaurant_name}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="input-field"
              required
            />
            <textarea
              placeholder="Notas (ex: Ementa, Morada...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
            <button type="submit" className="btn btn-primary" disabled={!restaurant_name.trim() || !eventDate}>
              {editingId ? 'Guardar Alterações' : 'Guardar Almoço'}
            </button>
          </form>
        </div>
      )}

      {events.length === 0 && !showForm && (
        <div className="empty-state mb-4">
          Nenhum almoço marcado ainda.
        </div>
      )}

      {upcomingEvents.length > 0 && (
        <div className="mb-4">
          <h3 className="section-title">Próximos Almoços</h3>
          {upcomingEvents.map(event => (
            <div key={event.id} className="card next-event-card mb-4" style={{ position: 'relative' }}>
              {isAdmin && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => setManagingAttendanceId(managingAttendanceId === event.id ? null : event.id)}
                    className="btn-icon"
                    style={{ padding: '4px', color: managingAttendanceId === event.id ? 'var(--color-primary)' : 'inherit' }}
                    aria-label="Presenças"
                  >
                    <CheckSquare size={16} />
                  </button>
                  <button
                    onClick={() => startEditing(event)}
                    className="btn-icon"
                    style={{ padding: '4px' }}
                    aria-label="Editar almoço"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => removeEvent(event.id)}
                    className="btn-icon btn-danger"
                    style={{ padding: '4px' }}
                    aria-label="Remover almoço"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
              <div className="card-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                  {new Date(event.date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="card-body mt-2">
                <h4 style={{ fontSize: '1.2rem', fontWeight: 600, paddingRight: '60px' }}>{event.restaurant_name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <CalendarDays size={16} color="var(--color-primary)" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
                    {new Date(event.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer', padding: '4px', borderRadius: '4px', backgroundColor: 'var(--color-surface)', width: 'fit-content' }}
                  onClick={() => setViewingAttendanceId(viewingAttendanceId === event.id ? null : event.id)}
                >
                  <Users size={16} color="var(--color-primary)" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
                    {event.participant_ids?.length || 0} Confirmados
                  </span>
                </div>
                
                {viewingAttendanceId === event.id && (
                  <div className="slide-down mt-2" style={{ backgroundColor: 'var(--color-surface)', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    {(event.participant_ids?.length || 0) > 0 && (
                      <div className="mb-2">
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Vão ao almoço:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {event.participant_ids.map(id => {
                            const member = members.find(m => m.id === id);
                            return member ? (
                              <span key={id} style={{ backgroundColor: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 500 }}>
                                {member.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    {(event.absent_ids?.length || 0) > 0 && (
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Não podem ir:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {event.absent_ids?.map(id => {
                            const member = members.find(m => m.id === id);
                            return member ? (
                              <span key={id} style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 500 }}>
                                {member.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {event.notes && (
                  <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap' }}>
                    {event.notes}
                  </p>
                )}
                <div style={{ marginTop: '12px' }}>
                  <span className="tag">
                    {getDaysLeft(event.date) === 0 ? 'É Hoje!' :
                      getDaysLeft(event.date) === 1 ? 'Amanhã' :
                        `Faltam ${getDaysLeft(event.date)} dias`}
                  </span>
                </div>

                {managingAttendanceId === event.id && (
                  <div className="attendance-panel mt-4 p-3 slide-down" style={{ backgroundColor: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <h5 style={{ fontSize: '0.95rem', marginBottom: '12px', fontWeight: 600 }}>Marcar Presenças</h5>
                    {members.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Não existem membros registados.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
                        {[...members].sort((a, b) => a.name.localeCompare(b.name)).map(member => {
                          const isGoing = (event.participant_ids || []).includes(member.id);
                          const isAbsent = (event.absent_ids || []).includes(member.id);

                          return (
                            <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--color-border)' }}>
                              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{member.name}</span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  onClick={() => setEventAttendance(event.id, member.id, isGoing ? 'none' : 'going')}
                                  style={{
                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #22c55e',
                                    backgroundColor: isGoing ? '#22c55e' : 'transparent',
                                    color: isGoing ? 'white' : '#22c55e',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Vou
                                </button>
                                <button
                                  onClick={() => setEventAttendance(event.id, member.id, isAbsent ? 'none' : 'absent')}
                                  style={{
                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #ef4444',
                                    backgroundColor: isAbsent ? '#ef4444' : 'transparent',
                                    color: isAbsent ? 'white' : '#ef4444',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Não Vou
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <button
                      onClick={() => setManagingAttendanceId(null)}
                      className="btn btn-primary mt-3"
                      style={{ width: '100%', padding: '6px' }}
                    >
                      Concluído
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pastEvents.length > 0 && (
        <div>
          <h3 className="section-title">Histórico</h3>
          {pastEvents.map(event => (
            <div key={event.id} className="card mb-4" style={{ opacity: 0.8, position: 'relative' }}>
              {isAdmin && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => setManagingAttendanceId(managingAttendanceId === event.id ? null : event.id)}
                    className="btn-icon"
                    style={{ padding: '4px', color: managingAttendanceId === event.id ? 'var(--color-primary)' : 'inherit' }}
                    aria-label="Presenças"
                  >
                    <CheckSquare size={16} />
                  </button>
                  <button
                    onClick={() => startEditing(event)}
                    className="btn-icon"
                    style={{ padding: '4px' }}
                    aria-label="Editar almoço"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => removeEvent(event.id)}
                    className="btn-icon btn-danger"
                    style={{ padding: '4px' }}
                    aria-label="Remover almoço"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
              <h4 style={{ fontSize: '1rem', fontWeight: 600, paddingRight: '60px' }}>{event.restaurant_name}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {new Date(event.date).toLocaleDateString('pt-PT')}
              </p>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer', padding: '4px', borderRadius: '4px', backgroundColor: 'var(--color-surface)', width: 'fit-content' }}
                onClick={() => setViewingAttendanceId(viewingAttendanceId === event.id ? null : event.id)}
              >
                <Users size={14} color="var(--color-text-muted)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {event.participant_ids?.length || 0} Confirmados
                </span>
              </div>

              {viewingAttendanceId === event.id && (
                <div className="slide-down mt-2" style={{ backgroundColor: 'var(--color-surface)', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  {(event.participant_ids?.length || 0) > 0 && (
                    <div className="mb-2">
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Foram ao almoço:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {event.participant_ids.map(id => {
                          const member = members.find(m => m.id === id);
                          return member ? (
                            <span key={id} style={{ backgroundColor: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 500 }}>
                              {member.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  {(event.absent_ids?.length || 0) > 0 && (
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Não foram:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {event.absent_ids?.map(id => {
                          const member = members.find(m => m.id === id);
                          return member ? (
                            <span key={id} style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 500 }}>
                              {member.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {managingAttendanceId === event.id && (
                <div className="attendance-panel mt-3 p-3 slide-down" style={{ backgroundColor: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <h5 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>Presenças no Histórico</h5>
                  {members.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Não existem membros registados.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                      {[...members].sort((a, b) => a.name.localeCompare(b.name)).map(member => {
                        const isGoing = (event.participant_ids || []).includes(member.id);
                        const isAbsent = (event.absent_ids || []).includes(member.id);

                        return (
                          <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--color-border)' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{member.name}</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => setEventAttendance(event.id, member.id, isGoing ? 'none' : 'going')}
                                style={{
                                  padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #22c55e',
                                  backgroundColor: isGoing ? '#22c55e' : 'transparent',
                                  color: isGoing ? 'white' : '#22c55e',
                                  cursor: 'pointer'
                                }}
                              >
                                Vou
                              </button>
                              <button
                                onClick={() => setEventAttendance(event.id, member.id, isAbsent ? 'none' : 'absent')}
                                style={{
                                  padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #ef4444',
                                  backgroundColor: isAbsent ? '#ef4444' : 'transparent',
                                  color: isAbsent ? 'white' : '#ef4444',
                                  cursor: 'pointer'
                                }}
                              >
                                Não Vou
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <button
                    onClick={() => setManagingAttendanceId(null)}
                    className="btn btn-primary mt-3"
                    style={{ width: '100%', padding: '4px', fontSize: '0.85rem' }}
                  >
                    Concluído
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function Payments({ isAdmin }: { isAdmin: boolean }) {
  const [members, setMembers] = useState<MemberLocal[]>([]);
  const [payments, setPayments] = useState<PaymentLocal[]>([]);
  const [expenses, setExpenses] = useState<ExpenseLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Form state
  const [formType, setFormType] = useState<'entrada' | 'saida' | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expDescription, setExpDescription] = useState('');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: membersData }, { data: paymentsData }, { data: expensesData }] = await Promise.all([
      supabase.from('members').select('*').order('name'),
      supabase.from('payments').select('*').order('payment_date', { ascending: false }),
      supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
    ]);
    if (membersData) setMembers(membersData);
    if (paymentsData) setPayments(paymentsData);
    if (expensesData) setExpenses(expensesData);
    setLoading(false);
  }

  // Fundo inicial genérico de 09/05/2026
  const INITIAL_FUND = 210;
  const totalIn = payments.reduce((s, p) => s + Number(p.amount), 0) + INITIAL_FUND;
  const totalOut = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const fundBalance = totalIn - totalOut;

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const startYear = 2026;
  const startMonthIndex = 6; // Julho = índice 6
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const getCotaStatus = (memberId: string, year: number, monthIndex: number) => {
    if (year < startYear || (year === startYear && monthIndex < startMonthIndex)) return { status: 'na' };
    
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    const cotaNote = `COTA-${year}-${monthStr}`;
    const payment = payments.find(p => p.member_id === memberId && p.notes === cotaNote);
    
    if (payment) return { status: 'paid', payment };
    if (year < currentYear || (year === currentYear && monthIndex <= currentMonth)) return { status: 'debt' };
    return { status: 'future' };
  };

  const getMemberDebt = (memberId: string) => {
    let debt = 0;
    for (let y = startYear; y <= currentYear; y++) {
      const endM = (y === currentYear) ? currentMonth : 11;
      const startM = (y === startYear) ? startMonthIndex : 0;
      for (let m = startM; m <= endM; m++) {
        const monthStr = String(m + 1).padStart(2, '0');
        const isPaid = payments.some(p => p.member_id === memberId && p.notes === `COTA-${y}-${monthStr}`);
        if (!isPaid) debt += 5;
      }
    }
    return debt;
  };

  const handleMarkAsPaid = async (memberId: string, year: number, monthIndex: number) => {
    if (!isAdmin) return;
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    const cotaNote = `COTA-${year}-${monthStr}`;
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from('payments').insert([{
      member_id: memberId, amount: 5, payment_date: today, notes: cotaNote
    }]);
    if (error) alert('Erro: ' + error.message);
    else fetchAll();
  };

  const handleRemoveCota = async (paymentId: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Remover pagamento desta cota?')) return;
    const { error } = await supabase.from('payments').delete().eq('id', paymentId);
    if (error) {
      alert('Erro ao remover: ' + error.message);
    } else {
      fetchAll();
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !amount) return;
    const { error } = await supabase.from('payments').insert([{
      member_id: selectedMemberId, amount: parseFloat(amount), payment_date: paymentDate, notes: notes.trim()
    }]);
    if (error) { alert('Erro: ' + error.message); return; }
    setFormType(null); setSelectedMemberId(''); setAmount(''); setNotes('');
    fetchAll();
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || !expDescription.trim()) return;
    const { error } = await supabase.from('expenses').insert([{
      amount: parseFloat(expAmount), expense_date: expDate, description: expDescription.trim()
    }]);
    if (error) { alert('Erro: ' + error.message); return; }
    setFormType(null); setExpAmount(''); setExpDescription('');
    fetchAll();
  };

  if (loading) return <div className="page p-4 fade-in" style={{ textAlign: 'center', paddingTop: '40px' }}>A carregar...</div>;

  return (
    <div className="page p-4 fade-in">
      <div className="welcome-section mb-4">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>Cotas &amp; Despesas</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Gestão financeira do grupo.</p>
      </div>

      <div className="card dashboard-card bg-primary mb-4">
        <div className="card-header"><span>Saldo da Caixa</span><Wallet size={20} /></div>
        <div className="card-body">
          <h3 className="amount">{fundBalance.toFixed(2)} €</h3>
          <p className="subtitle">À data de {new Date().toLocaleDateString('pt-PT')}</p>
        </div>
      </div>

      {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <button className={`btn ${formType === 'entrada' ? 'btn-primary' : ''}`} onClick={() => setFormType(formType === 'entrada' ? null : 'entrada')} style={{ padding: '10px', fontSize: '0.9rem', border: '1px solid var(--color-primary)', color: formType === 'entrada' ? 'white' : 'var(--color-primary)', background: formType === 'entrada' ? 'var(--color-primary)' : 'transparent', borderRadius: '8px' }}>
            + Entrada Avulsa
          </button>
          <button className={`btn ${formType === 'saida' ? 'btn-primary' : ''}`} onClick={() => setFormType(formType === 'saida' ? null : 'saida')} style={{ padding: '10px', fontSize: '0.9rem', border: '1px solid var(--color-primary)', color: formType === 'saida' ? 'white' : 'var(--color-primary)', background: formType === 'saida' ? 'var(--color-primary)' : 'transparent', borderRadius: '8px' }}>
            - Nova Despesa
          </button>
        </div>
      )}

      {/* Formulários */}
      {formType === 'entrada' && isAdmin && (
        <div className="card mb-4 slide-down">
          <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Registar Entrada Avulsa</h3>
          <form onSubmit={handleAddPayment} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <select value={selectedMemberId} onChange={e => setSelectedMemberId(e.target.value)} className="input-field" required>
              <option value="">-- Passarinho --</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input type="number" step="0.01" placeholder="Valor (€)" value={amount} onChange={e => setAmount(e.target.value)} className="input-field" required />
              <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="input-field" required />
            </div>
            <input type="text" placeholder="Notas (ex: Doação)" value={notes} onChange={e => setNotes(e.target.value)} className="input-field" />
            <button type="submit" className="btn btn-primary" disabled={!selectedMemberId || !amount}>Guardar</button>
          </form>
        </div>
      )}

      {formType === 'saida' && isAdmin && (
        <div className="card mb-4 slide-down" style={{ borderLeft: '3px solid var(--color-primary)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Registar Despesa</h3>
          <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input type="text" placeholder="Descrição" value={expDescription} onChange={e => setExpDescription(e.target.value)} className="input-field" required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input type="number" step="0.01" placeholder="Valor (€)" value={expAmount} onChange={e => setExpAmount(e.target.value)} className="input-field" required />
              <input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} className="input-field" required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={!expAmount || !expDescription.trim()}>Guardar</button>
          </form>
        </div>
      )}

      <div className="card mb-4" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Grelha de Cotas (5€/mês)</h3>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="input-field" style={{ width: 'auto', padding: '4px 8px', margin: 0 }}>
            {[2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid var(--color-border)', width: '110px', minWidth: '110px', position: 'sticky', left: 0, background: 'var(--color-card)', zIndex: 2, boxShadow: '2px 0 4px rgba(0,0,0,0.08)' }}>Passarinho</th>
                {months.map(m => (
                  <th key={m} style={{ padding: '8px 4px', borderBottom: '2px solid var(--color-border)', textAlign: 'center', width: '32px', minWidth: '32px' }}>{m}</th>
                ))}
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '2px solid var(--color-border)', minWidth: '70px' }}>Em Dívida</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => {
                const debt = getMemberDebt(member.id);
                return (
                  <tr key={member.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '8px', fontWeight: 500, position: 'sticky', left: 0, background: 'var(--color-card)', zIndex: 1, boxShadow: '2px 0 4px rgba(0,0,0,0.08)', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</td>
                    {months.map((_, idx) => {
                      const { status, payment } = getCotaStatus(member.id, selectedYear, idx);
                      let content = <span style={{ color: 'var(--color-border)' }}>-</span>;
                      
                      if (status === 'paid') {
                        content = (
                          <div 
                            title={`Pago a ${new Date(payment!.payment_date).toLocaleDateString('pt-PT')}`}
                            onClick={() => isAdmin && handleRemoveCota(payment!.id)}
                            style={{ 
                              width: '24px', height: '24px', borderRadius: '4px', background: '#22c55e', 
                              margin: '0 auto', cursor: isAdmin ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            <CheckSquare size={14} color="white" />
                          </div>
                        );
                      } else if (status === 'debt') {
                        content = (
                          <div 
                            title={isAdmin ? "Em dívida - Clique para pagar" : "Em dívida"}
                            onClick={() => isAdmin && handleMarkAsPaid(member.id, selectedYear, idx)}
                            style={{ 
                              width: '24px', height: '24px', borderRadius: '4px', background: '#ef4444', 
                              margin: '0 auto', cursor: isAdmin ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            {isAdmin && <Plus size={14} color="white" style={{ opacity: 0.8 }} />}
                          </div>
                        );
                      } else if (status === 'future') {
                        content = (
                          <div 
                            title={isAdmin ? "Ainda não venceu - Clique para pagar adiantado" : "Ainda não venceu"}
                            onClick={() => isAdmin && handleMarkAsPaid(member.id, selectedYear, idx)}
                            style={{ 
                              width: '24px', height: '24px', borderRadius: '4px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', 
                              margin: '0 auto', cursor: isAdmin ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            {isAdmin && <Plus size={14} color="var(--color-text-muted)" style={{ opacity: 0.3 }} />}
                          </div>
                        );
                      }

                      return <td key={idx} style={{ padding: '4px', textAlign: 'center' }}>{content}</td>;
                    })}
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600, color: debt > 0 ? '#ef4444' : 'var(--color-text-muted)' }}>
                      {debt > 0 ? `${debt.toFixed(2)}€` : '0.00€'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {expenses.length > 0 && (
        <>
          <h3 className="section-title">Despesas Recentes</h3>
          {expenses.slice(0, 5).map(exp => (
            <div key={exp.id} className="card mb-3" style={{ borderLeft: '3px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{exp.description}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{new Date(exp.expense_date).toLocaleDateString('pt-PT')}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '1rem' }}>-{Number(exp.amount).toFixed(2)}€</span>
                  {isAdmin && (
                    <button onClick={async () => {
                      if(window.confirm('Remover?')) {
                        await supabase.from('expenses').delete().eq('id', exp.id);
                        fetchAll();
                      }
                    }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {payments.filter(p => !p.notes?.startsWith('COTA-')).length > 0 && (
        <>
          <h3 className="section-title">Entradas Avulsas Recentes</h3>
          {payments.filter(p => !p.notes?.startsWith('COTA-')).slice(0, 5).map(p => {
            const member = members.find(m => m.id === p.member_id);
            return (
              <div key={p.id} className="card mb-3" style={{ borderLeft: '3px solid #22c55e' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {member?.name || 'Desconhecido'} {p.notes ? `(${p.notes})` : ''}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{new Date(p.payment_date).toLocaleDateString('pt-PT')}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '1rem' }}>+{Number(p.amount).toFixed(2)}€</span>
                    {isAdmin && (
                      <button onClick={async () => {
                        if(window.confirm('Remover?')) {
                          await supabase.from('payments').delete().eq('id', p.id);
                          fetchAll();
                        }
                      }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default App;

