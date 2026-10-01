import { Component, ReactNode } from 'react';

interface State { failed: boolean }

/** Beklenmeyen bir hatada beyaz ekran yerine kurtarma ekranı gösterir; CV verisi silinmez. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State { return { failed: true }; }
  componentDidCatch(err: unknown) { console.error('CVDoldur hata:', err); }

  backup = () => {
    try {
      const raw = localStorage.getItem('cvdoldur_data') || '{}';
      const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'cvdoldur-yedek.json'; a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div style={{ maxWidth: 480, margin: '15vh auto', padding: 24, fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Bir şeyler ters gitti</h1>
        <p style={{ color: '#475569', fontSize: 14, marginBottom: 20 }}>
          CV bilgileriniz bu cihazda kayıtlı, silinmedi. Sayfayı yenilemek çoğu zaman sorunu çözer.
        </p>
        <button onClick={() => location.reload()} style={{ background: '#0f766e', color: '#fff', border: 0, borderRadius: 10, padding: '10px 18px', marginRight: 8, cursor: 'pointer' }}>Sayfayı yenile</button>
        <button onClick={this.backup} style={{ background: '#e2e8f0', border: 0, borderRadius: 10, padding: '10px 18px', cursor: 'pointer' }}>Verimi yedekle (JSON)</button>
      </div>
    );
  }
}
