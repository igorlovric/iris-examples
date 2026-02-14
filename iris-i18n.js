/**
 * Iris Modal Library - i18n Translations
 * Add this file AFTER iris.js to enable multi-language support
 */

// English (US)
Iris.i18n['en-US'] = {
    name: 'English',
    translations: {
        ok: 'OK',
        cancel: 'Cancel',
        yes: 'Yes',
        no: 'No',
        close: 'Close',
        confirm: 'Confirm',
        prompt: 'Input',
        info: 'Information',
        success: 'Success',
        warning: 'Warning',
        error: 'Error',
        loading: 'Loading...',
        loadError: 'Error loading content: {0}',
        maximize: 'Maximize',
        restore: 'Restore'
    }
};

// Serbian (RS)
Iris.i18n['sr-RS'] = {
    name: 'Srpski',
    translations: {
        ok: 'U redu',
        cancel: 'Otkaži',
        yes: 'Da',
        no: 'Ne',
        close: 'Zatvori',
        confirm: 'Potvrda',
        prompt: 'Unos',
        info: 'Informacija',
        success: 'Uspeh',
        warning: 'Upozorenje',
        error: 'Greška',
        loading: 'Učitavanje...',
        loadError: 'Greška pri učitavanju sadržaja: {0}',
        maximize: 'Maksimiziraj',
        restore: 'Vrati'
    }
};

// German (DE) - Example
Iris.i18n['de-DE'] = {
    name: 'Deutsch',
    translations: {
        ok: 'OK',
        cancel: 'Abbrechen',
        yes: 'Ja',
        no: 'Nein',
        close: 'Schließen',
        confirm: 'Bestätigen',
        prompt: 'Eingabe',
        info: 'Information',
        success: 'Erfolg',
        warning: 'Warnung',
        error: 'Fehler',
        loading: 'Laden...',
        loadError: 'Fehler beim Laden des Inhalts: {0}',
        maximize: 'Maximieren',
        restore: 'Wiederherstellen'
    }
};

// French (FR) - Example
Iris.i18n['fr-FR'] = {
    name: 'Français',
    translations: {
        ok: 'OK',
        cancel: 'Annuler',
        yes: 'Oui',
        no: 'Non',
        close: 'Fermer',
        confirm: 'Confirmer',
        prompt: 'Saisie',
        info: 'Information',
        success: 'Succès',
        warning: 'Avertissement',
        error: 'Erreur',
        loading: 'Chargement...',
        loadError: 'Erreur lors du chargement du contenu: {0}',
        maximize: 'Agrandir',
        restore: 'Restaurer'
    }
};

// Spanish (ES) - Example
Iris.i18n['es-ES'] = {
    name: 'Español',
    translations: {
        ok: 'Aceptar',
        cancel: 'Cancelar',
        yes: 'Sí',
        no: 'No',
        close: 'Cerrar',
        confirm: 'Confirmar',
        prompt: 'Entrada',
        info: 'Información',
        success: 'Éxito',
        warning: 'Advertencia',
        error: 'Error',
        loading: 'Cargando...',
        loadError: 'Error al cargar el contenido: {0}',
        maximize: 'Maximizar',
        restore: 'Restaurar'
    }
};

// Set default language
// Iris.setLanguage('en-US'); // Uncomment to set English as default
console.log('Iris i18n loaded. Available languages:', Iris.getAvailableLanguages().map(l => l.name).join(', '));
