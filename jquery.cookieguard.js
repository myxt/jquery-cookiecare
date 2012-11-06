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
    $.cookieGuard = function (options) {

        var COOKIE_PREFIX = 'cg-',
            COOKIE_APPROVED_VALUE = 'approved',
            COOKIE_DENIED_VALUE = 'denied';

        var defaults = {
                position: 'bottom',
                mode: 'implicit', // Implicit or explicit. Implicit means cookies are placed without explicit consent. Explicit requires the use to accept cookies.
                threshold: 3, // The amount of page refreshes the message is shown before an implicit accept is triggered.
                message: 'This website is using cookies to improve our customer experience. <a href="/privacy">More information</a>.', // The message to show in the toolbar, usually with a link to the privacy and/or cookie policy.
                hideMessageButtonText: 'Hide message', // Close button text.
                enableOptOut: true, // Show a link to disable cookies?
                denyCookiesButtonText: 'Disable cookies' // Disable cookies link text.
            },
            options = jQuery.extend(defaults, options),
            cookies = {
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
            jQuery("script.cg-" + type + '[type="text/plain"]').each(function () {
                if (jQuery(this).attr("src")) {
                    jQuery(this).after('<script type="text/javascript" src="' + jQuery(this).attr("src") + '"><\/script>');
                } else {
                    jQuery(this).after('<script type="text/javascript">' + jQuery(this).html() + "<\/script>");
                }
            });
            cookies[type].executed = true;
        }

        function reset () {
            setCookie('impressions', null);
            jQuery.each(cookies, function (type) {
                setCookie(type, null);
            });
        }

        function draw () {
            var position = options.position == 'top' ? 'top' : 'bottom';
            jQuery('body').append('<div id="cg" class="cg-fixed-' + position + '" style="display: none;"><div class="container"><div class="row"><div id="cg-message" class="span7">' + options.message + '</div><div class="span5"><div id="cg-buttons" class="pull-right"></div></div></div></div></div>');
            jQuery('#cg-buttons').append('<a id="cg-button-accept" class="btn btn-success" href="#" title="' + options.hideMessageButtonText + '">' + options.hideMessageButtonText + '</a>');
            if(options.enableOptOut)
                jQuery('#cg-buttons').append(' <a id="cg-button-deny" class="btn btn-link" href="#" title="' + options.denyCookiesButtonText + '">' + options.denyCookiesButtonText + '</a>');

            jQuery('#cg-button-accept').on( 'click', function (e) {
                approveAllTypes();
                hideToolbar();
            });
            jQuery('#cg-button-deny').on( 'click', function (e) {
                denyAllTypes();
                hideToolbar();
            });

        }

        function showToolbar () {
            updateImpressions();
            jQuery('#cg').show('fast');
        }

        function hideToolbar () {
            jQuery('#cg').hide('fast');
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

        function approveAllTypes () {
            jQuery.each(cookies, function (type) {
                setCookie(type, COOKIE_APPROVED_VALUE);
            });
        }

        function denyAllTypes () {
            jQuery.each(cookies, function (type) {
                setCookie(type, COOKIE_DENIED_VALUE);
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
