/**
 * Copyright (C) 2012 Sander van den Akker (sander@myxt.nl)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * THIS SOFTWARE AND DOCUMENTATION IS PROVIDED "AS IS," AND COPYRIGHT
 * HOLDERS MAKE NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO, WARRANTIES OF MERCHANTABILITY OR
 * FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE SOFTWARE
 * OR DOCUMENTATION WILL NOT INFRINGE ANY THIRD PARTY PATENTS,
 * COPYRIGHTS, TRADEMARKS OR OTHER RIGHTS.COPYRIGHT HOLDERS WILL NOT
 * BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL OR CONSEQUENTIAL
 * DAMAGES ARISING OUT OF ANY USE OF THE SOFTWARE OR DOCUMENTATION.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://gnu.org/licenses/>.
 */
(function ($) {
    $.cookieCare = function (options) {

        var COOKIE_PREFIX = 'cc-',
            COOKIE_APPROVED_VALUE = 'approved',
            COOKIE_DENIED_VALUE = 'denied';

        var defaults = {
                position: 'bottom',
                mode: 'implicit', // Implicit or explicit. Implicit means cookies are placed without explicit consent. Explicit requires the use to accept cookies.
                threshold: 5, // The amount of page refreshes the message is shown before an implicit accept is triggered.
                message: 'This website is using cookies to improve our customer experience. <a href="/privacy">More information</a>.', // The message to show in the toolbar, usually with a link to the privacy and/or cookie policy.
                hideMessageButtonText: 'Hide message', // Close button text.
                enableOptOut: true, // Show a link to disable cookies?
                settingsLink: '/cookies',
                settingsButtonText: 'Settings', // Disable cookies link text.
                settingsChooseText: 'Choose your preference.',
                settingsSavedText: 'Settings saved.'
            },
            options = jQuery.extend(defaults, options),
            cookies = {
                strict: {},
                analytical: {},
                social: {}
            },
            ask = false;

        initialize();

        function initialize () {

            if (getImpressions() >= options.threshold && options.mode == 'implicit')
                approveAllTypes();

            jQuery.each(cookies, function (type) {
                var value = getCookie(type);
                if (value == COOKIE_DENIED_VALUE) {
                    // Do nothing
                }
                else if (value == COOKIE_APPROVED_VALUE) {
                    execute(type);
                }
                else {
                    ask = true;
                    if(options.mode == 'implicit')
                        execute(type);
                }
            });

            draw();

            if(ask)
                showToolbar();

        }

        function execute (type) {
            jQuery("script.cc-" + type + '[type="text/plain"]').each(function () {
                if (jQuery(this).attr("src")) {
                    jQuery(this).after('<script type="text/javascript" src="' + jQuery(this).attr("src") + '"><\/script>');
                } else {
                    jQuery(this).after('<script type="text/javascript">' + jQuery(this).html() + "<\/script>");
                }
            });
            cookies[type].executed = true;
        }

        function draw () {
            var position = options.position == 'top' ? 'top' : 'bottom';
            jQuery('body').append('<div id="cc" class="cc-fixed-' + position + '" style="display: none;"><div class="container"><div class="row"><div id="cc-message" class="span7">' + options.message + '</div><div class="span5"><div id="cc-buttons" class="pull-right"></div></div></div></div></div>');
            jQuery('#cc-buttons').append('<a id="cc-button-accept" class="btn btn-small btn-success" href="#" title="' + options.hideMessageButtonText + '">' + options.hideMessageButtonText + '</a>');
            if(options.enableOptOut)
                jQuery('#cc-buttons').append(' <a id="cc-button-deny" class="btn btn-small btn-link" href="' + options.settingsLink + '" title="' + options.settingsButtonText + '">' + options.settingsButtonText + '</a>');

            bind();

        }

        function bind () {
            jQuery('#cc-button-accept').on( 'click', function (e) {
                approveAllTypes();
                hideToolbar();
            });
            jQuery('#cc-button-save-inline').on( 'click', function (e) {
                e.preventDefault();
                storeSettings();
                hideToolbar();
            });

            jQuery('#cc-button-reset-inline').on( 'click', function (e) {
                e.preventDefault();
                resetSettings();
            });
        }

        function storeSettings () {
            var choice = jQuery('#cc-settings-form input[name="types"]:checked').val();
            if(typeof choice == 'undefined') {
                jQuery('.cookiesettings').prepend('<div class="alert alert-danger fade in"><a class="close" data-dismiss="alert" href="#">&times;</a>' + options.settingsChooseText + '</div>');
                return;
            }
            var approvedTypes = choice.split(',');
            jQuery.each(cookies, function (type) {
                if( jQuery.inArray( type, approvedTypes ) != -1 )
                    approveCookieType(type);
                else
                    denyCookieType(type);
            });
            jQuery('.cookiesettings').prepend('<div class="alert fade in"><a class="close" data-dismiss="alert" href="#">&times;</a>' + options.settingsSavedText + '</div>');
        }

        function resetSettings () {
            setCookie('impressions', null);
            jQuery.each(cookies, function (type) {
                setCookie(type, null);
            });
            jQuery('.cookiesettings').prepend('<div class="alert fade in"><a class="close" data-dismiss="alert" href="#">&times;</a>' + options.settingsSavedText + '</div>');
        }

        function showToolbar () {
            updateImpressions();
            jQuery('#cc').show('fast');
        }

        function hideToolbar () {
            jQuery('#cc').hide('fast');
        }

        function getImpressions () {
            var impressions = parseInt(getCookie('impressions'));
            if(!impressions) impressions = 0;
            return impressions;
        }

        function updateImpressions () {
            var count = getImpressions() + 1;
            setCookie('impressions', count);
            return count;
        }

        function approveCookieType (type) {
            setCookie(type, COOKIE_APPROVED_VALUE);
        }

        function denyCookieType (type) {
            setCookie(type, COOKIE_DENIED_VALUE);
        }

        function approveAllTypes () {
            jQuery.each(cookies, function (type) {
                approveCookieType(type);
            });
        }

        function getCookie (type) {
            return jQuery.cookie(COOKIE_PREFIX + type);
        }

        function setCookie (type, value) {
            jQuery.cookie(COOKIE_PREFIX + type, value, {
                path: '/',
                expires: 365
            });
        }

    }
})(jQuery);
