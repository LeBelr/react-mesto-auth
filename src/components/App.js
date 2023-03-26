import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Main from "./Main.js";
import Footer from "./Footer.js";
import ImagePopup from "./ImagePopup.js";
import api from "../utils/api.js";
import { CurrentUserContext } from "../contexts/CurrentUserContext.js";
import EditProfilePopup from "./EditProfilePopup.js";
import EditAvatarPopup from "./EditAvatarPopup.js";
import AddPlacePopup from "./AddPlacePopup.js";
import ProtectedRoute from "./ProtectedRoute.js";
import Register from "./Register.js";
import Login from "./Login.js";
import InfoTooltip from "./InfoTooltip.js";
import * as auth from "../utils/auth.js"


function App() {
  // Хуки состояния для открытия  попапов
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);

  // Хуки состояния для выбранной карточки, пользователя и карточек
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);

  // Хуки состояния для входа, регистрации, почты
  const [loggedIn, setLoggedIn] = useState(false);
  const [isRegOk, setIsRegOk] = useState(false);
  const [email, setEmail] = useState('');

  // Хук для переадресации
  const navigate = useNavigate();

  //Функции для смены состояния открытия попапов

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleCardClick(card) {
    setIsImagePopupOpen(true);
    setSelectedCard(card)
  }

  // Функция изменения состояний для закрытия любого попапа

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsImagePopupOpen(false);
    setSelectedCard({});
    setIsInfoTooltipOpen(false);
  }

  // Функция установки и удаления лайка

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    api.changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
      })
      .catch((err) => {
        console.log(err);
      })
  }

  // Функция удаления карточки

  function handleCardDelete(card) {
    api.handleDeleteCard(card._id)
      .then(() => {
        setCards((state) => state.filter((c) => c._id !== card._id));
      })
      .catch((err) => {
        console.log(err);
      })
  }

  // Функция изменения данных профиля

  function handleUpdateUser(user) {
    api.editProfile(user)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
  }

  // Функция изменения аватара

  function handleUpdateAvatar(user) {
    api.changeAvatar(user)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
  }

  // Функция добавления карточки

  function handleAddPlaceSubmit(card) {
    api.createCard(card)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
  }

  // Функция для входа
  function handleLogin(data) {
    setEmail(data.email);
    auth.login(data)
      .then((data) => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          setLoggedIn(true);
          navigate('/', { replace: true });
        }
      })
      .catch(() => {
        setIsRegOk(false);
        setIsInfoTooltipOpen(true);
      })
  }

  // Функция для регистрации
  function handleRegister(data) {
    auth.register(data)
      .then(() => {
        setIsRegOk(true);
        setIsInfoTooltipOpen(true);
      })
      .catch(() => {
        setIsRegOk(false);
        setIsInfoTooltipOpen(true);
      })
  }
  // Функция для выхода
  function handleLogout() {
    localStorage.removeItem('token');
    setLoggedIn(false);
    navigate('/sign-in', { replace: true });
  }

  // Функция для автоматического входа
  function checkToken() {
    if (localStorage.getItem('token')) {
      const token = localStorage.getItem('token');
      auth.checkToken(token)
        .then((res) => {
          if (res) {
            setLoggedIn(true);
            navigate('/', { replace: true });
            setEmail(res.data.email);
          }
        })
    }
  }

  // Хук для получения и установки данных пользователя и карточек

  useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then((data) => {
        setCurrentUser(data[0]);
        setCards(data[1]);
      })
      .catch((err) => {
        console.log(err);
      })
  }, [])

  // Хук для автоматического входа
  useEffect(() => {
    checkToken();
  }, [])

  return (
    <>
      <CurrentUserContext.Provider value={currentUser}>
        <div className="page">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute
                component={Main}
                cards={cards}
                onEditProfile={handleEditProfileClick}
                onAddPlace={handleAddPlaceClick}
                onEditAvatar={handleEditAvatarClick}
                onCardClick={handleCardClick}
                onCardLike={handleCardLike}
                onCardDelete={handleCardDelete}
                loggedIn={loggedIn}
                email={email}
                onLogout={handleLogout}
              />}
            />
            <Route path="sign-up" element={<Register onRegister={handleRegister} />} />
            <Route path="/sign-in" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {!loggedIn && <InfoTooltip isOpen={isInfoTooltipOpen} onClose={closeAllPopups} isRegOk={isRegOk} />}

          {loggedIn && <Footer />}

          {loggedIn && <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
          />}

          {loggedIn && <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onAddPlace={handleAddPlaceSubmit}
          />}

          {loggedIn && <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
          />}

          {loggedIn && <ImagePopup
            card={selectedCard}
            onClose={closeAllPopups}
            isOpen={isImagePopupOpen}
          />}

        </div>
      </CurrentUserContext.Provider>
    </>
  );
}

export default App;
