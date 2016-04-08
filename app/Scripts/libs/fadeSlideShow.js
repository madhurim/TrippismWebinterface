/*
 * fadeSlideShow
 * v.2.0.0
 *
 * Copyright (c) 2010 Pascal Bajorat (http://www.pascal-bajorat.com)
 * Dual licensed under the MIT (below)
 * and GPL (http://www.gnu.org/licenses/gpl.txt) licenses.
 *
 *
 * http://plugins.jquery.com/project/fadeslideshow
 * http://www.pascal-bajorat.com

MIT License

Copyright (c) 2010 Pascal Bajorat

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

jQuery.fn.fadeSlideShow = function (options) {
    return this.each(function () {
        settings = jQuery.extend({
            width: 640, // default width of the slideshow
            height: 480, // default height of the slideshow
            speed: 'slow', // default animation transition speed
            interval: 3000, // default interval between image change,
            autoplay: true
        }, options);

        // set style for wrapper element
        jQuery(this).css({
            width: settings.width,
            height: settings.height,
            position: 'relative',
            overflow: 'hidden'
        });

        // set styles for child element
        jQuery('> *', this).css({
            position: 'absolute',
            width: settings.width,
            height: settings.height
        });

        // count number of slides
        Slides = jQuery('> *', this).length;
        Slides = Slides - 1;
        ActSlide = Slides;
        // Set jQuery Slide short var
        jQslide = jQuery('> *', this);
        // save this
        fssThis = this;

        autoplay = function () {
            intval = setInterval(function () {
                jQslide.eq(ActSlide).fadeOut(settings.speed);
                // if list is on change the active class
                if (ActSlide <= 0) {
                    ActSlide = Slides;
                    jQslide.eq(ActSlide).fadeIn(settings.speed, function () { jQslide.fadeIn(); });
                } else {
                    ActSlide = ActSlide - 1;
                    jQslide.eq(ActSlide).css({ opacity: 1 });
                }
            }, settings.interval);
        }

        // start autoplay or set it to false
        if (settings.autoplay) { autoplay(); } else { intval = false; }
    });
};