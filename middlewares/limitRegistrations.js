export function limitRegistrations(req, res, next) {
  const gameID = req.params.gameID;

  if (!req.session.registrations) {
    req.session.registrations = {};
  }

  const count = req.session.registrations[gameID] || 0;

  if (count >= 2) {
    return res.status(403).json({
      message: "You can only register 2 players for this game"
    });
  }

  next();
}
