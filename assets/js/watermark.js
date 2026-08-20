const domSymbol = Symbol('watermark-dom');
function useWatermark(appendEl = document.body) {
    function useRafThrottle(fn) {
        let locked = false;
        return function (...args) {
            if (locked) return;
            locked = true;
            window.requestAnimationFrame(() => {
                fn.apply(this, args);
                locked = false;
            });
        };
    }

    const func = useRafThrottle(function () {
        const el = appendEl;
        if (!el) return;
        const height = window.innerHeight;
        const width = window.innerWidth;
        updateWatermark({height, width});
    });
    const id = domSymbol.toString();
    let watermarkEl = document.getElementById(id) || "";



    function createBase64(str) {
        const can = document.createElement("canvas");
        const width = str.length <= 5 ? 260 : 40 * str.length;
        const height = str.length <= 5 ? 240 : 20 * str.length;
        Object.assign(can, {width, height});
        const cans = can.getContext("2d");
        if (cans) {
            cans.rotate((-20 * Math.PI) / 180);
            cans.font = "20px Vedana";
            cans.fillStyle = "rgba(0, 0, 0, 0.15)";
            cans.textAlign = "left";
            cans.textBaseline = "middle";
            cans.fillText(str, 0, (height / 2));

        }
        return can.toDataURL("image/png");
    }

    function updateWatermark(options) {
        const el = watermarkEl;
        if (!el) return;
        if (options.width !== undefined) {
            el.style.width = `${options.width}px`;
        }
        if (options.height !== undefined) {
            el.style.height = `${options.height}px`;
        }
        if (options.str !== undefined) {
            el.style.background = `url(${createBase64(options.str)}) left top repeat`;
        }
    }

    const createWatermark = (str) => {
        if (watermarkEl) {
            updateWatermark({
                str,
                width: window.innerWidth,
                height: window.innerHeight
            });
            return id;
        }
        const div = document.createElement("div");
        watermarkEl = div;
        div.id = id;
        div.style.pointerEvents = "none";
        div.style.top = "0px";
        div.style.left = "0px";
        div.style.right = "0px";
        div.style.bottom = "0px";
        div.style.position = "fixed";
        div.style.zIndex = "100000";
        const el = appendEl;
        if (!el) return id;
        const height = window.innerHeight;
        const width = window.innerWidth;
        updateWatermark({str, width, height});
        el.appendChild(div);
        return id;
    };

    function setWatermark(str) {
        createWatermark(str);
    }

    return {setWatermark, updateWatermark};
}

function refreshPageWatermark() {
    var watermark = window.pageData &&
        window.pageData.extra &&
        window.pageData.extra.watermark &&
        window.pageData.extra.watermark.text || "akuowen";
    useWatermark().setWatermark(watermark);
}

window.refreshPageWatermark = refreshPageWatermark;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refreshPageWatermark);
} else {
    refreshPageWatermark();
}

document.addEventListener("encrypted-content:unlocked", refreshPageWatermark);
window.addEventListener("resize", refreshPageWatermark);
