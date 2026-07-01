/**
 * Prevents closing a dialog while an async action is in progress.
 *
 * @param {boolean} isBusy
 * @param {(open: boolean) => void} setOpen
 * @returns {(open: boolean) => void}
 */
export function createDialogOpenChangeHandler(isBusy, setOpen) {
  return (open) => {
    if (isBusy) {
      return;
    }

    setOpen(open);
  };
}

/**
 * @param {boolean} isBusy
 * @returns {(event: Event) => void}
 */
export function preventDialogDismissWhenBusy(isBusy) {
  return (event) => {
    if (isBusy) {
      event.preventDefault();
    }
  };
}
