class Iris {
    /**
     * Library information
     * @constant {Object}
     */
    static info = {
        name: 'Iris',
        version: '1.0.6',
        date: '2025-02-15',
        author: 'Igor Lovrić',
        license: 'MIT'
    };

    static instances = [];
    static baseZIndex = 1050;

    // Multilanguage support
    static currentLanguage = 'en-US'; // Default language
    static i18n = {
        'en-US': {
            code: 'en-US',
            name: 'English (United States)',
            translations: {
                loading: 'Loading...',
                close: 'Close',
                cancel: 'Cancel',
                ok: 'OK',
                yes: 'Yes',
                no: 'No',
                confirm: 'Confirm',
                prompt: 'Enter Value',
                delete: 'Delete',
                save: 'Save',
                error: 'Error',
                warning: 'Warning',
                success: 'Success',
                info: 'Information',
                loadError: 'Error loading content: {0}',
                confirmDelete: 'Are you sure you want to delete this item?',
                confirmAction: 'Are you sure you want to proceed?'
            }
        }
    };


    // Type constants (dialog size)
    static SIZE_SMALL = 'modal-sm';
    static SIZE_NORMAL = '';
    static SIZE_LARGE = 'modal-lg';
    static SIZE_XLARGE = 'modal-xl';
    static SIZE_FULLWIDTH = 'modal-fullwidth';
    static SIZE_FULLSCREEN = 'modal-fullscreen';

    // Type constants (header colors)
    static TYPE_DEFAULT = 'default';
    static TYPE_PRIMARY = 'primary';
    static TYPE_SUCCESS = 'success';
    static TYPE_INFO = 'info';
    static TYPE_WARNING = 'warning';
    static TYPE_DANGER = 'danger';
    static TYPE_DARK = 'dark';

    static defaults = {
        backdrop: true,
        keyboard: true,
        closeOnBackdrop: true,
        spinIcon : 'spinner-border spinner-border-sm',
        size: Iris.SIZE_NORMAL,
        type: Iris.TYPE_DEFAULT
    };

    /**
     * Creates a new Iris dialog instance
     *
     * @constructor
     * @example
     * const dialog = new Iris();
     * dialog.show({ title: 'Hello', message: 'World' });
     */
    constructor() {
        this.modalElement = null;
        this.modalInstance = null;
        this.options = {};
        this.zIndex = Iris.baseZIndex + (Iris.instances.length * 10);
        Iris.instances.push(this);
    }

    /**
     * Displays the dialog with specified options
     *
     * @param {Object} options - Dialog configuration options
     * @param {string} options.title - Dialog title
     * @param {string} options.message - Dialog content (HTML allowed)
     * @param {string} options.size - Dialog size (use Iris.SIZE_* constants)
     * @param {string} options.type - Dialog type (use Iris.TYPE_* constants)
     * @param {boolean} options.centered - Vertically center the dialog
     * @param {boolean} options.draggable - Enable drag and drop
     * @param {Array<Object>} options.buttons - Array of button objects
     * @param {Function} options.onshow - Callback before showing
     * @param {Function} options.onshown - Callback after showing
     */

    show(options) {
        this.options = {
            ...Iris.defaults,
            ...options
        };

        this.createModal();

        if (this.options.onshow) {
            this.options.onshow(this);
        }

        const backdropOption = this.options.closeOnBackdrop ? true : 'static';

        this.modalInstance = new bootstrap.Modal(this.modalElement, {
            backdrop: this.options.backdrop === false ? false : backdropOption,
            keyboard: this.options.keyboard
        });

        if (this.options.draggable) {
            this.makeDraggable();
        }

        if (this.options.ajaxUrl) {
            this.loadContent(this.options.ajaxUrl);
        }

        this.modalElement.addEventListener('shown.bs.modal', () => {
            if (this.options.onshown) {
                this.options.onshown(this);
            }
        });

        this.modalElement.addEventListener('hide.bs.modal', (e) => {
            if (this.options.onhide) {
                const result = this.options.onhide(this);
                if (result === false) {
                    e.preventDefault();
                    return false;
                }
            }
        });

        this.modalElement.addEventListener('hidden.bs.modal', () => {
            if (this.options.onhidden) {
                this.options.onhidden(this);
            }
            this.destroy();
        });

        this.setZIndex();
        this.modalInstance.show();
    }

    createModal() {
        const modalId = 'dynamicModal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const closeButton = this.options.closeButton !== false ?
            `<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${Iris.t('close')}"></button>` : '';

        const headerClass = this.getHeaderClass();
        const textClass = this.getHeaderTextClass();

        const html = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div ${this.options.id?`id="${this.options.id}"`:''} class="modal-dialog ${this.options.size} ${this.options.centered ? 'modal-dialog-centered' : ''} ${this.options.scrollable ? 'modal-dialog-scrollable' : ''}">
                    <div class="modal-content">
                        ${this.options.title ? `
                        <div class="modal-header ${headerClass}">
                            <h5 class="modal-title ${textClass}">${this.options.title}</h5>
                            ${closeButton}
                        </div>` : ''}
                        <div class="modal-body">
                            ${this.options.message || `<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">${Iris.t('loading')}</span></div></div>`}
                        </div>
                        ${this.options.buttons ? `
                        <div class="modal-footer">
                            ${this.renderButtons()}
                        </div>` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        this.modalElement = document.getElementById(modalId);
    }

    getHeaderClass() {
        const typeMap = {
            'default': '',
            'primary': 'bg-primary',
            'success': 'bg-success',
            'info': 'bg-info',
            'warning': 'bg-warning',
            'danger': 'bg-danger',
            'dark': 'bg-dark'
        };

        return typeMap[this.options.type] || '';
    }

    getHeaderTextClass() {
        const darkTextTypes = ['warning'];
        if (this.options.type === 'default') { return ''; }
        return darkTextTypes.includes(this.options.type) ? 'text-dark' : 'text-white';
    }

    renderButtons() {
        if (!this.options.buttons || this.options.buttons.length === 0) return '';

        return this.options.buttons.map((btn, index) => {
            const btnId = btn.id?btn.id:'btn_' + Math.random().toString(36).substr(2, 9);
            const icon=btn.icon?`<i class="${btn.icon}"></i> `:'';

            this._buttonRefs = this._buttonRefs || [];
            this._buttonRefs[index] = { id: btnId, config: btn };

            setTimeout(() => {
                const buttonElement = document.getElementById(btnId);
                if (buttonElement) {
                    buttonElement._originalHTML = buttonElement.innerHTML;
                    buttonElement._isSpinning = false;

                    buttonElement.addEventListener('click', (e) => {
                        if (btn.action) {
                            if (btn.autoSpin) {
                                this.buttonSpin(index, true);
                            }
                            const result = btn.action(this, e);
                            if (result !== false && btn.autoClose !== false && btn.autoSpin) {
                                this.buttonSpin(index, false);
                            }
                            if (result !== false && btn.autoClose !== false) {
                                this.close();
                            }
                        } else {
                            if (btn.autoClose !== false) {
                                this.close();
                            }
                        }
                    });
                }
            }, 100);

            return `<button type="button" id="${btnId}" class="btn ${btn.cssClass || 'btn-secondary'}" ${btn.disabled ? 'disabled' : ''}>${icon}${btn.label}</button>`;
        }).join('');
    }

    /**
     * Loads content via AJAX into the dialog body
     *
     * @param {string} url - URL to fetch content from
     * @param {Object} params - Optional query parameters to send with the request
     */
    loadContent(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        fetch(fullUrl)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.text();
            })
            .then(html => {
                this.getModalBody().innerHTML = html;
                if (this.options.onContentLoaded) {
                    this.options.onContentLoaded(this);
                }
            })
            .catch(error => {
                this.getModalBody().innerHTML = `<div class="alert alert-danger">${Iris.t('loadError', error.message)}</div>`;
            });
    }

    setZIndex() {
        this.modalElement.style.zIndex = this.zIndex;

        setTimeout(() => {
            const backdrops = document.querySelectorAll('.modal-backdrop');
            if (backdrops.length > 0) {
                const lastBackdrop = backdrops[backdrops.length - 1];
                lastBackdrop.style.zIndex = this.zIndex - 1;
            }
        }, 50);
    }

    makeDraggable() {
        const header = this.modalElement.querySelector('.modal-header');
        const dialog = this.modalElement.querySelector('.modal-dialog');

        if (!header) return;

        let isDragging = false;
        let hasMoved = false;
        let currentX = 0, currentY = 0, initialX = 0, initialY = 0;
        let startX = 0, startY = 0;

        header.style.cursor = 'move';
        header.style.userSelect = 'none';

        const dragStart = (e) => {
            const rect = dialog.getBoundingClientRect();

            if (e.type === 'mousedown') {
                initialX = e.clientX - rect.left;
                initialY = e.clientY - rect.top;
                startX = e.clientX;
                startY = e.clientY;
            } else if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - rect.left;
                initialY = e.touches[0].clientY - rect.top;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }

            isDragging = true;
            hasMoved = false;
        };

        const drag = (e) => {
            if (!isDragging) return;

            let clientX, clientY;

            if (e.type === 'mousemove') {
                clientX = e.clientX;
                clientY = e.clientY;
            } else if (e.type === 'touchmove') {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }

            const deltaX = Math.abs(clientX - startX);
            const deltaY = Math.abs(clientY - startY);

            if (!hasMoved && (deltaX > 5 || deltaY > 5)) {
                hasMoved = true;

                const rect = dialog.getBoundingClientRect();
                const currentWidth = dialog.offsetWidth;

                dialog.style.position = 'fixed';
                dialog.style.margin = '0';
                dialog.style.width = currentWidth + 'px';

                dialog.style.left = rect.left + 'px';
                dialog.style.top = rect.top + 'px';
                dialog.style.transform = 'none';
            }

            if (!hasMoved) return;

            e.preventDefault();

            currentX = clientX - initialX;
            currentY = clientY - initialY;

            const maxX = window.innerWidth - dialog.offsetWidth;
            const maxY = window.innerHeight - dialog.offsetHeight;

            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));

            dialog.style.left = currentX + 'px';
            dialog.style.top = currentY + 'px';
        };

        const dragEnd = () => {
            isDragging = false;
            hasMoved = false;
        };

        header.addEventListener('mousedown', dragStart);
        header.addEventListener('touchstart', dragStart);

        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);

        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
    }

    /**
     * Closes the dialog
     *
     * @param {boolean} force - If true, forces close without calling onhide event
     */
    close(force = false) {
        if (force) {
            if (this.modalInstance) {
                this.modalElement.removeEventListener('hide.bs.modal', () => {});
                this.modalInstance.hide();
            }
        } else {
            if (this.modalInstance) {
                this.modalInstance.hide();
            }
        }
    }

    destroy() {
        if (this.modalElement) {
            this.modalElement.remove();
        }

        const index = Iris.instances.indexOf(this);
        if (index > -1) {
            Iris.instances.splice(index, 1);
        }

        if (Iris.instances.length === 0) {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    }

    /**
     * Returns the DOM element of the dialog body
     *
     * @returns {HTMLElement} The modal body element
     */
    getModalBody() {
        return this.modalElement.querySelector('.modal-body');
    }

    /**
     * Returns the DOM element of the dialog footer
     *
     * @returns {HTMLElement} The modal footer element
     */
    getModalFooter() {
        return this.modalElement.querySelector('.modal-footer');
    }

    /**
     * Returns the DOM element of the dialog header
     *
     * @returns {HTMLElement} The modal header element
     */
    getModalHeader() {
        return this.modalElement.querySelector('.modal-header');
    }



    /**
     * Returns button instance
     *
     * @param {number|string} identifier - Button identifier:
     *   - {number} Button index (0-based, first button is 0)
     *   - {string} Button ID (with or without '#' prefix)
     *   - {string} Button label text (exact match)
     *
     * @example
     * // Get instance by index
     * dialog.getButton(0);  // Enable first button
     *
     * @example
     * // Get instance by ID
     * dialog.getButton('btn_save');
     * dialog.getButton('#btn_save');
     *
     * @example
     * // Get instance by label text
     * dialog.getButton('Save');
     */
    getButton(identifier) {
        const footer = this.getModalFooter();
        if (!footer) return;

        let button = null;

        if (typeof identifier === 'number') {
            const buttons = footer.querySelectorAll('button');
            button = buttons[identifier];
        }
        else if (typeof identifier === 'string') {
            const id = identifier.startsWith('#') ? identifier.slice(1) : identifier;
            button = footer.querySelector(`#${id}`);

            if (!button) {
                const buttons = footer.querySelectorAll('button');
                button = Array.from(buttons).find(btn => btn.textContent.trim() === identifier);
            }
        }

        return button;
    }

    /**
     * Changes the dialog title
     *
     * @param {string} title - New title text (HTML allowed)
     *
     * @example
     * dialog.setTitle('New Title');
     * dialog.setTitle('<strong>Bold</strong> Title');
     */
    setTitle(title) {
        const titleElement = this.modalElement.querySelector('.modal-title');
        if (titleElement) {
            titleElement.innerHTML = title;
        }
    }

    /**
     * Changes the dialog body content
     *
     * @param {string} content - New content (HTML allowed)
     *
     * @example
     * dialog.setContent('<p>New content</p>');
     * dialog.setContent('Simple text');
     */
    setContent(content) {
        this.getModalBody().innerHTML = content;
    }

    /**
     * Changes the dialog type (header color theme)
     * Updates the header background color and text color based on the type.
     * Also adjusts the close button style to match the theme.
     *
     * @param {string} type - Dialog type (use Iris.TYPE_* constants)
     *
     * @example
     * dialog.setType(Iris.TYPE_SUCCESS);
     * dialog.setType(Iris.TYPE_DANGER);
     *
     * @see Iris.TYPE_DEFAULT
     * @see Iris.TYPE_PRIMARY
     * @see Iris.TYPE_SUCCESS
     * @see Iris.TYPE_INFO
     * @see Iris.TYPE_WARNING
     * @see Iris.TYPE_DANGER
     * @see Iris.TYPE_DARK
     */
    setType(type) {
        const header = this.getModalHeader();
        console.log(header);
        if (header) {
            header.classList.remove('bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger', 'bg-dark');

            const title = header.querySelector('.modal-title');
            if (title) {
                title.classList.remove('text-white', 'text-dark');
            }
            const closeBtn = header.querySelector('.btn-close');

            this.options.type = type;
            const headerClass = this.getHeaderClass();
            const textClass = this.getHeaderTextClass();
            const btnCloseClass=textClass=='text-dark'?' ':'btn-close-white';

            if (headerClass) {
                header.classList.add(headerClass);
            }
            if (title && textClass) {
                title.classList.add(...textClass.split(' '));
            }
            if (closeBtn && btnCloseClass) {
                closeBtn.classList.remove('btn-close-white');
                closeBtn.classList.add(...btnCloseClass.split(' '));
            }
        }
    }

    /**
     * Enables a button in the dialog footer
     *
     * @param {number|string} identifier - Button identifier:
     *   - {number} Button index (0-based, first button is 0)
     *   - {string} Button ID (with or without '#' prefix)
     *   - {string} Button label text (exact match)
     *
     * @example
     * // Enable by index
     * dialog.enableButton(0);  // Enable first button
     *
     * @example
     * // Enable by ID
     * dialog.enableButton('btn_save');
     * dialog.enableButton('#btn_save');
     *
     * @example
     * // Enable by label text
     * dialog.enableButton('Save');
     */
    enableButton(identifier) {
        const footer = this.getModalFooter();
        if (!footer) return;

        let button = null;

        if (typeof identifier === 'number') {
            const buttons = footer.querySelectorAll('button');
            button = buttons[identifier];
        }
        else if (typeof identifier === 'string') {
            const id = identifier.startsWith('#') ? identifier.slice(1) : identifier;
            button = footer.querySelector(`#${id}`);

            if (!button) {
                const buttons = footer.querySelectorAll('button');
                button = Array.from(buttons).find(btn => btn.textContent.trim() === identifier);
            }
        }

        if (button) {
            button.disabled = false;
        }
    }

    /**
     * Disables a button in the dialog footer
     *
     * @param {number|string} identifier - Button identifier:
     *   - {number} Button index (0-based, first button is 0)
     *   - {string} Button ID (with or without '#' prefix)
     *   - {string} Button label text (exact match)
     *
     * @example
     * // Disable by index
     * dialog.disableButton(0);  // Disable first button
     *
     * @example
     * // Disable by ID
     * dialog.disableButton('btn_save');
     * dialog.disableButton('#btn_save');
     *
     * @example
     * // Disable by label text
     * dialog.disableButton('Save');
     */
    disableButton(identifier) {
        const footer = this.getModalFooter();
        if (!footer) return;

        let button = null;

        if (typeof identifier === 'number') {
            const buttons = footer.querySelectorAll('button');
            button = buttons[identifier];
        }
        else if (typeof identifier === 'string') {
            const id = identifier.startsWith('#') ? identifier.slice(1) : identifier;
            button = footer.querySelector(`#${id}`);
            if (!button) {
                const buttons = footer.querySelectorAll('button');
                button = Array.from(buttons).find(btn => btn.textContent.trim() === identifier);
            }
        }

        if (button) {
            button.disabled = true;
        }
    }

    /**
     * Enables or disables all buttons in the dialog footer
     *
     * @param {boolean} enable - If true, enables all buttons. If false, disables all buttons.
     *
     * @example
     * // Disable all buttons
     * dialog.enableButtons(false);
     *
     * @example
     * // Enable all buttons
     * dialog.enableButtons(true);
     *
     * @example
     * // Disable during AJAX call
     * dialog.enableButtons(false);
     * fetch('/api/save')
     *     .then(() => dialog.enableButtons(true))
     *     .catch(() => dialog.enableButtons(true));
     */
    enableButtons(enable) {
        const footer = this.getModalFooter();
        if (!footer) return;

        const buttons = footer.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = !enable;
        });
    }

    /**
     * Starts or stops a spinner animation on a button
     *
     * @param {number|string} identifier - Button index (0-based), button ID, or button label
     * @param {boolean} spin - If true, starts spinner. If false, stops spinner and restores original content.
     *
     * @example
     * // Start spinner on first button
     * dialog.buttonSpin(0, true);
     *
     * @example
     * // Stop spinner on first button
     * dialog.buttonSpin(0, false);
     *
     * @example
     * // By button ID
     * dialog.buttonSpin('btn_save', true);
     *
     * @example
     * // By button label
     * dialog.buttonSpin('Save', true);
     *
     * @example
     * // Common use case with AJAX
     * buttons: [{
     *     label: 'Save',
     *     cssClass: 'btn-primary',
     *     action: function(dialogRef) {
     *         dialogRef.buttonSpin(0, true);
     *
     *         fetch('/api/save')
     *             .then(() => {
     *                 dialogRef.buttonSpin(0, false);
     *                 dialogRef.close();
     *             })
     *             .catch(() => {
     *                 dialogRef.buttonSpin(0, false);
     *             });
     *
     *         return false;
     *     }
     * }]
     */
    buttonSpin(identifier, spin) {
        const footer = this.getModalFooter();
        if (!footer) return;

        let button = null;

        // Find button by index, ID, or label
        if (typeof identifier === 'number') {
            const buttons = footer.querySelectorAll('button');
            button = buttons[identifier];
        }
        else if (typeof identifier === 'string') {
            const id = identifier.startsWith('#') ? identifier.slice(1) : identifier;
            button = footer.querySelector(`#${id}`);

            if (!button) {
                const buttons = footer.querySelectorAll('button');
                button = Array.from(buttons).find(btn => btn.textContent.trim() === identifier);
            }
        }

        if (!button) return;

        // Initialize original HTML if not already stored
        if (!button._originalHTML) {
            button._originalHTML = button.innerHTML;
            button._isSpinning = false;
        }

        if (spin) {
            // Start spinning
            if (!button._isSpinning) {
                button._isSpinning = true;
                button.disabled = true;

                const spinnerClass = this.options.spinIcon || 'spinner-border spinner-border-sm';
                const spinnerHTML = `<span class="${spinnerClass}" role="status" aria-hidden="true"></span>`;

                // Check if button has an icon already
                const icon = button.querySelector('i, svg, .icon');
                if (icon) {
                    // Replace existing icon with spinner
                    button._originalIcon = icon.outerHTML;
                    icon.outerHTML = spinnerHTML;
                } else {
                    // Prepend spinner before text
                    button.innerHTML = `${spinnerHTML} ${button.textContent.trim()}`;
                }
            }
        } else {
            // Stop spinning
            if (button._isSpinning) {
                button._isSpinning = false;
                button.disabled = false;
                button.innerHTML = button._originalHTML;
            }
        }
    }

    /**
     * Starts or stops spinner on all buttons
     *
     * @param {boolean} spin - If true, starts spinner on all buttons. If false, stops all spinners.
     *
     * @example
     * // Start spinner on all buttons
     * dialog.buttonSpinAll(true);
     *
     * @example
     * // Stop spinner on all buttons
     * dialog.buttonSpinAll(false);
     */
    buttonSpinAll(spin) {
        const footer = this.getModalFooter();
        if (!footer) return;

        const buttons = footer.querySelectorAll('button');
        buttons.forEach((button, index) => {
            this.buttonSpin(index, spin);
        });
    }

    /**
     * Enables or disables the ability to close the dialog
     * When set to false, disables all closing methods (backdrop, keyboard, close button, buttons).
     * When set back to true, restores only the originally enabled closing methods.
     *
     * @param {boolean} closable - If true, allows closing. If false, prevents all closing methods.
     *
     * @example
     * // Make dialog non-closable during processing
     * dialog.setClosable(false);
     *
     * @example
     * // Restore original closing behavior
     * dialog.setClosable(true);
     *
     * @example
     * // Typical use case: prevent closing during AJAX
     * dialog.setClosable(false);
     * fetch('/api/process')
     *     .then(() => {
     *         dialog.setClosable(true);
     *         dialog.close();
     *     })
     *     .catch(() => dialog.setClosable(true));
     */
    setClosable(closable) {
        if (!this.modalInstance) return;

        // First time setClosable(false) is called - save original settings
        if (!closable && this._originalClosableState === undefined) {
            this._originalClosableState = {
                backdrop: this.options.backdrop,
                closeOnBackdrop: this.options.closeOnBackdrop,
                keyboard: this.options.keyboard,
                closeButton: this.options.closeButton
            };
        }

        if (!closable) {
            // Disable all closing methods
            this.options.closeOnBackdrop = false;
            this.options.keyboard = false;
            this.options.closeButton = false;

            // Update Bootstrap modal config
            this.modalInstance._config.backdrop = 'static';
            this.modalInstance._config.keyboard = false;

            // Hide close button if it exists
            const closeButton = this.modalElement.querySelector('.btn-close');
            if (closeButton) {
                closeButton.style.display = 'none';
            }

            // Disable all footer buttons
            // this.enableButtons(false);

        } else {
            // Restore original settings
            if (this._originalClosableState) {
                this.options.closeOnBackdrop = this._originalClosableState.closeOnBackdrop;
                this.options.keyboard = this._originalClosableState.keyboard;
                this.options.closeButton = this._originalClosableState.closeButton;

                // Update Bootstrap modal config
                const backdropOption = this._originalClosableState.closeOnBackdrop ? true : 'static';
                this.modalInstance._config.backdrop = this._originalClosableState.backdrop === false ? false : backdropOption;
                this.modalInstance._config.keyboard = this._originalClosableState.keyboard;

                // Show close button if it was originally enabled
                if (this._originalClosableState.closeButton) {
                    const closeButton = this.modalElement.querySelector('.btn-close');
                    if (closeButton) {
                        closeButton.style.display = '';
                    }
                }

                // Enable all footer buttons
                // this.enableButtons(true);

                // Clear saved state
                delete this._originalClosableState;
            }
        }
    }

    /**
     * Static method for translating a key to current language
     *
     * @static
     * @param {string} key - Translation key
     * @param {...string} args - Optional arguments to replace placeholders {0}, {1}, etc.
     * @returns {string} Translated text
     *
     * @example
     * Iris.t('loading') // Returns: "Loading..."
     * Iris.t('loadError', 'Network timeout') // Returns: "Error loading content: Network timeout"
     */
    static t(key, ...args) {
        const lang = Iris.currentLanguage;
        const translations = Iris.i18n[lang]?.translations || Iris.i18n['en-US']?.translations || {};
        let text = translations[key] || key;

        args.forEach((arg, index) => {
            text = text.replace(`{${index}}`, arg);
        });

        return text;
    }

    static setLanguage(langCode) {
        if (Iris.i18n[langCode]) {
            Iris.currentLanguage = langCode;
            return true;
        }
        console.warn(`Language '${langCode}' not found. Available: ${Object.keys(Iris.i18n).join(', ')}`);
        return false;
    }

    static getAvailableLanguages() {
        return Object.keys(Iris.i18n).map(code => ({
            code: code,
            name: Iris.i18n[code].name
        }));
    }

    /**
     * Static method for displaying a dialog directly without creating an instance
     *
     * @param {Object} options - Dialog configuration options
     * @param {string} options.title - Dialog title
     * @param {string} options.message - Dialog content (HTML allowed)
     * @param {string} options.size - Dialog size (use Iris.SIZE_* constants)
     * @param {string} options.type - Dialog type (use Iris.TYPE_* constants)
     * @param {boolean} options.centered - Vertically center the dialog
     * @param {boolean} options.draggable - Enable drag and drop
     * @param {Array<Object>} options.buttons - Array of button objects
     * @param {Function} options.onshow - Callback before showing
     * @param {Function} options.onshown - Callback after showing
     */
    static show(options) {
        const dialog = new Iris();
        dialog.show(options);
        return dialog;
    }

    static alert(message, title = Iris.t('info'), options = {}) {
        return Iris.show({
            title: title,
            message: message,
            type: Iris.TYPE_INFO,
            buttons: [
                {
                    label: Iris.t('ok'),
                    cssClass: 'btn-primary',
                    autoClose: true
                }
            ],
            ...options
        });
    }

    static confirm(message, title = Iris.t('confirm'), options = {}) {
        return new Promise((resolve) => {
            Iris.show({
                title: title,
                message: message,
                type: Iris.TYPE_WARNING,
                buttons: [
                    {
                        label: Iris.t('no'),
                        cssClass: 'btn-secondary',
                        action: () => resolve(false)
                    },
                    {
                        label: Iris.t('yes'),
                        cssClass: 'btn-primary',
                        action: () => resolve(true)
                    }
                ],
                ...options
            });
        });
    }

    static prompt(message, title = Iris.t('prompt'), defaultValue = '', options = {}) {
        return new Promise((resolve) => {
            const inputId = 'prompt_' + Math.random().toString(36).substr(2, 9);

            Iris.show({
                title: title,
                message: `
                    <p>${message}</p>
                    <input type="text" id="${inputId}" class="form-control" value="${defaultValue}">
                `,
                type: Iris.TYPE_INFO,
                buttons: [
                    {
                        label: Iris.t('cancel'),
                        cssClass: 'btn-secondary',
                        action: () => resolve(null)
                    },
                    {
                        label: Iris.t('ok'),
                        cssClass: 'btn-primary',
                        action: (dialog) => {
                            const input = document.getElementById(inputId);
                            resolve(input ? input.value : null);
                        }
                    }
                ],
                onshown: (dialog) => {
                    const input = document.getElementById(inputId);
                    if (input) {
                        input.focus();
                        input.select();
                    }
                },
                ...options
            });
        });
    }

    static success(message, title = Iris.t('success'), options = {}) {
        return Iris.show({
            title: title,
            message: message,
            type: Iris.TYPE_SUCCESS,
            buttons: [
                {
                    label: Iris.t('ok'),
                    cssClass: 'btn-success',
                    autoClose: true
                }
            ],
            ...options
        });
    }

    static error(message, title = Iris.t('error'), options = {}) {
        return Iris.show({
            title: title,
            message: message,
            type: Iris.TYPE_DANGER,
            buttons: [
                {
                    label: Iris.t('ok'),
                    cssClass: 'btn-danger',
                    autoClose: true
                }
            ],
            ...options
        });
    }

    static warning(message, title = Iris.t('warning'), options = {}) {
        return Iris.show({
            title: title,
            message: message,
            type: Iris.TYPE_WARNING,
            buttons: [
                {
                    label: Iris.t('ok'),
                    cssClass: 'btn-warning',
                    autoClose: true
                }
            ],
            ...options
        });
    }
}