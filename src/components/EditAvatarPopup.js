import { useState, useEffect, useRef } from "react";
import PopupWithForm from "./PopupWithForm";


export default function EditAvatarPopup({ isOpen, onClose, onUpdateAvatar }) {

  const [avatar, setAvatar] = useState('');
  const avatarInputRef = useRef();

  function handleChangeAvatar(e) {
    setAvatar(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();

    onUpdateAvatar({
      avatar: avatarInputRef.current.value
    })
  }

  useEffect(() => {
    setAvatar('');
  }, [isOpen]);

  return (
    <PopupWithForm
      title='Обновить Аватар'
      name='avatar'
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <input id="avatar-input" type="url" className="popup__input popup__input_type_avatar" name="avatar"
        placeholder="Ссылка на картинку" required value={avatar} ref={avatarInputRef} onChange={handleChangeAvatar} />
      <span className="popup__input-error avatar-input-error"></span>
    </PopupWithForm>
  )
}