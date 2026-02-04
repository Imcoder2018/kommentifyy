class Toaster {
    constructor() {
        // Use window.iziToast as it's loaded globally
        if (typeof window.iziToast !== 'undefined') {
            window.iziToast.settings({
                position: "topRight",
                timeout: 5000,
                progressBar: true,
                close: true,
                animateInside: false, // Turn off for performance
                transitionIn: 'fadeInLeft',
                transitionOut: 'fadeOutRight'
            });
        }
    }

    _show(type, message, title = '') {
        if (typeof window.iziToast !== 'undefined') {
            window.iziToast[type]({ title, message });
        } else {
            // Fallback for environments where iziToast isn't available
            console.log(`[Toaster.${type}] ${title}: ${message}`);
        }
    }

    success = (message, title = 'Success') => this._show('success', message, title);
    error = (message, title = 'Error') => this._show('error', message, title);
    warning = (message, title = 'Warning') => this._show('warning', message, title);
    info = (message, title = 'Info') => this._show('info', message, title);
}

export const toast = new Toaster();

