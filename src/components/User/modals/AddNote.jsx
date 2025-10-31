import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { BsArrowLeft } from "react-icons/bs";
import { useLanguage } from "../../../contexts/LanguageContext";

const AddNoteModel = ({ show, handleClose, onSave, orderNote }) => {
  const [note, setNote] = useState(orderNote || "");
  const [isFirstTimeEntry, setIsFirstTimeEntry] = useState(false);
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();

  useEffect(() => {
    if (show) {
      setIsFirstTimeEntry(!orderNote || orderNote.trim() === "");
      setNote(orderNote || "");
    }
  }, [show, orderNote]);

  const handleSave = () => {
    onSave(note);
    handleClose();
  };

  const handleCancelLikeActions = () => {
    if (isFirstTimeEntry) {
      setNote("");
      onSave("");
    } else {
      setNote(orderNote || "");
    }
    handleClose();
  };

  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNote(val);
    if (isFirstTimeEntry && val.trim() !== "") setIsFirstTimeEntry(false);
  };

  return (
    <Modal
      show={show}
      onHide={handleCancelLikeActions}
      backdrop="static"
      keyboard
      centered
      size="md"
      id="noteModal"
      enforceFocus={false}
      restoreFocus={true}
      autoFocus={false}
    >
      <Modal.Header>
        <button
          type="button"
          onClick={handleCancelLikeActions}
          className="back-btn"
        >
          <BsArrowLeft size={18} />
        </button>
        <Modal.Title className="modal-title">
          {currentLanguage.add} {currentLanguage.note}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="note-body">
        <textarea
          id="noteTextarea"
          className="note-textarea"
          cols={20}
          rows={5}
          placeholder="Enter your note here..."
          value={note}
          onChange={handleNoteChange}
          autoFocus
          onFocus={(e) => {
            const len = e.target.value.length;
            e.target.setSelectionRange(len, len);
          }}
        />

        <div className="note-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={handleCancelLikeActions}
          >
            {currentLanguage.cancel}
          </button>
          <button type="button" className="btn-save" onClick={handleSave}>
            {orderNote ? currentLanguage.update : currentLanguage.save}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AddNoteModel;
