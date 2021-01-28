import $ from 'jquery';
import less from "../stylesheets/styles.less";

let mapPoints = [[55.801131, 37.508167], [55.757556, 37.651592]];
let supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
let myMap;
let firstMapCall = true;

function mapInit() {
    myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 7
    });
    for (let i = 0; i < mapPoints.length; i++) {
        myMap.geoObjects.add(new ymaps.GeoObject({
            geometry: {
                type: "Point",
                coordinates: mapPoints[i]
            }
        }, {
            cursor: "default",
            hasBalloon: false,
            iconLayout: 'default#image',
            iconImageHref: './src/img/map_point.png',
            iconImageSize: [30, 42],
            iconImageOffset: [-5, -38]
        }));
    }
    myMap.setBounds(myMap.geoObjects.getBounds());
    if (supportsTouch) {
        myMap.behaviors.disable('drag');
    }
}

$(document).ready(function () {
    $(".tab-item").click(function () {
        if (!$(this).hasClass("active")) {
            $(".tab-item").removeClass("active");
            $(this).addClass("active");
            $(".tab-content").hide();
            $(this).next().show();
        }
    });
    $("#tab_pickup").click(function () {
        if (firstMapCall) {
            ymaps.ready(mapInit);
            firstMapCall = false;
        }
    });
    let phoneEl = $('#phone');
    phoneEl.on('keydown', function (e) {
        let keyChar = String.fromCharCode(e.which);
        setTimeout(function () {
            let res = /[^0-9]/g.exec(keyChar);
            if (e.which !== 8 && (res || (phoneEl.attr("val") && phoneEl.attr("val").length >= 10))) {
                phoneEl.val(phoneEl.attr("lastVal"));
                setCaretPosition("phone", findCaretPosition());
                return;
            }
            if (e.which === 8) {
                phoneEl.attr("val", phoneEl.attr("val").substring(0, phoneEl.attr("val").length - 1));
            } else {
                phoneEl.attr("val", phoneEl.attr("val") + keyChar);
            }
            let nth = -1;
            let str = "+7 (___) ___-__-__".replace(/_/g, function (match, i, original) {
                nth++;
                if (phoneEl.attr("val") && phoneEl.attr("val")[nth]) {
                    return phoneEl.attr("val")[nth];
                } else {
                    return match;
                }
            });
            phoneEl.val(str);
            phoneEl.attr("lastVal", phoneEl.val());
            setCaretPosition("phone", findCaretPosition());
        }, 0);
    });

    phoneEl.click(function () {
        setTimeout(function () {
            if (!phoneEl.attr("val")) {
                phoneEl.val("+7 (___) ___-__-__");
                phoneEl.attr("lastVal", "+7 (___) ___-__-__");
                setCaretPosition("phone", 4);
            } else {
                setCaretPosition("phone", findCaretPosition());
            }
        }, 0);
    });
});

function findCaretPosition() {
    let phoneEl = $('#phone');
    let nth = -1;
    let lastMatch = 3;
    "+7 (___) ___-__-__".replace(/_/g, function (match, i, original) {
        nth++;
        if (phoneEl.attr("val") && phoneEl.attr("val")[nth]) {
            lastMatch = i;
            return phoneEl.attr("val")[nth];
        } else {
            return match;
        }
    });
    return lastMatch + 1;
}

function setCaretPosition(elemId, caretPos) {
    let elem = document.getElementById(elemId);

    if (elem != null) {
        if (elem.createTextRange) {
            let range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        } else {
            if (elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos);
            } else
                elem.focus();
        }
    }
}

function sendForm(button) {
    $(button).closest(".tab-content").find('input,textarea,select').filter('[required]:visible').each(function () {
        $(this).removeClass("text-invalid");
        $(this).siblings(".error-message").remove();
        if (!$(this).val()) {
            addErrorMsg($(this), "Обязательное поле");
        } else {
            switch ($(this).attr("validate")) {
                case "fio":
                    if (/[^а-яё \-]/gi.exec($(this).val())) {
                        addErrorMsg($(this), "Недопустимые символы");
                    }
                    break;
                case "phone":
                    if (!$(this).attr("val") || $(this).attr("val").length < 10) {
                        addErrorMsg($(this), "Обязательное поле");
                    }
                    break;
                default:
                    break;
            }
        }
    });
}

window.sendForm = sendForm;

function addErrorMsg(elem, msg) {
    elem.addClass("text-invalid");
    elem.after("<label class=\"error-message\">" + msg + "</label>");
}