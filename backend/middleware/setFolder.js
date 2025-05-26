module.exports = function (req, res, next) {
    const folderId = req.query.folder_id || 'general'; // ← usa query
    req.folderId = folderId;
    next();
  };
  