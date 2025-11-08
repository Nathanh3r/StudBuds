export default function HomePage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>StudBuds</h1>
      <p>Welcome to StudBuds</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/login" style={{ marginRight: '10px' }}>Login</a>
        <a href="/signup">Sign Up</a>
      </div>
    </div>
  );
}