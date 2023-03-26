export default function PopupWithForm({title, name, btnText, children, isOpen, onClose, onSubmit}) {

  return (
    <div className={`popup popup_type_${name} ${isOpen ? 'popup_opened' : ''}`}>
      <div className="popup__content">
        <button type="button" className={`popup__close popup__close_type_${name}`} onClick={onClose}></button>
        <h2 className={`popup__title popup__title_type_${name}`}>{title}</h2>
        <form className="popup__form" name={`${name}Form`} onSubmit={onSubmit}>
          {children}
          <button type="submit" className={`popup__submit popup__submit_type_${name}`}>{btnText || 'Сохранить'}</button>
        </form>
      </div>
    </div>
  )
}