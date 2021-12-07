const router = require('express').Router();
const { create, signin, update, sendEmail, consultant, socialMedia, Refresh, getAllUsers, userBan, userUnBan } = require('../controllers/userController');

router.post('/register', create);
router.post('/login', signin);
router.post('/update', update);
router.post('/sendEmail', sendEmail);
router.post('/consultant', consultant);
router.post('/socialMediaLogin', socialMedia);
router.post('/refresh', Refresh);
router.get('/getUsers', getAllUsers);
router.post('/userBan', userBan);
router.post('/userUnban', userUnBan);

module.exports = router;