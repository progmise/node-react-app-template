// Presentational — renders the sign-in button or the user chip.
// Knows nothing about where `user` came from.
export default function SessionMenu({ user }) {
  return (
    <div className="user">
      {user ? (
        <>
          <img src={user.avatar_url} alt="" width="24" height="24" />
          <span>{user.login}</span>
          <a href="/api/logout">Sign out</a>
        </>
      ) : (
        <a className="login-btn" href="/api/auth/login">Sign in with GitHub</a>
      )}
    </div>
  );
}
