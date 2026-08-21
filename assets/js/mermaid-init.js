(function () {
    "use strict";

    if (!window.mermaid) {
        return;
    }

    var appearance = document.body && document.body.getAttribute("a") || "auto";
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var useDarkTheme = appearance === "dark" || appearance === "auto" && prefersDark;

    window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: useDarkTheme ? "dark" : "default"
    });

    function createLightbox() {
        var dialog = document.createElement("dialog");
        var closeButton = document.createElement("button");
        var content = document.createElement("div");

        dialog.className = "mermaid-lightbox";
        dialog.setAttribute("aria-label", "Mermaid 图表放大预览");
        closeButton.className = "mermaid-lightbox__close";
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "关闭图表预览");
        closeButton.textContent = "×";
        content.className = "mermaid-lightbox__content";

        closeButton.addEventListener("click", function () {
            dialog.close();
        });
        dialog.addEventListener("click", function (event) {
            if (event.target === dialog) {
                dialog.close();
            }
        });
        dialog.addEventListener("close", function () {
            content.replaceChildren();
        });

        dialog.appendChild(closeButton);
        dialog.appendChild(content);
        document.body.appendChild(dialog);

        return {
            open: function (sourceSvg) {
                var clone = sourceSvg.cloneNode(true);
                var viewBox = sourceSvg.viewBox && sourceSvg.viewBox.baseVal;
                var naturalWidth = viewBox && viewBox.width || sourceSvg.getBoundingClientRect().width;
                clone.removeAttribute("height");
                clone.style.width = Math.max(naturalWidth, window.innerWidth * 0.9) + "px";
                clone.style.height = "auto";
                clone.style.maxWidth = "none";
                content.replaceChildren(clone);
                dialog.showModal();
                closeButton.focus();
            }
        };
    }

    function enableLightbox() {
        var lightbox = createLightbox();

        document.querySelectorAll(".mermaid svg").forEach(function (svg) {
            svg.setAttribute("role", "button");
            svg.setAttribute("tabindex", "0");
            svg.setAttribute("aria-label", "点击放大 Mermaid 图表");
            svg.addEventListener("click", function () {
                lightbox.open(svg);
            });
            svg.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    lightbox.open(svg);
                }
            });
        });
    }

    window.mermaid.run({querySelector: ".mermaid"})
        .then(enableLightbox)
        .catch(function (error) {
            console.error("Mermaid render failed:", error);
        });
}());
