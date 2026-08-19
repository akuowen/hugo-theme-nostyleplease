(function () {
  "use strict";

  var encoder = new TextEncoder();
  var decoder = new TextDecoder();

  function fromBase64(value) {
    var binary = atob(value);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  async function deriveKey(password, payload) {
    var keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: fromBase64(payload.salt),
        iterations: payload.iterations,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
  }

  async function decryptHtml(password, payload) {
    if (payload.version !== 1 || payload.kdf !== "PBKDF2-SHA-256" || payload.cipher !== "AES-256-GCM") {
      throw new Error("Unsupported encrypted content format");
    }

    var key = await deriveKey(password, payload);
    var decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(payload.iv) },
      key,
      fromBase64(payload.ciphertext)
    );

    return decoder.decode(decrypted);
  }

  function showStatus(status, message) {
    status.textContent = message;
    status.hidden = !message;
  }

  function setupEncryptedContent(root) {
    var payloadNode = root.querySelector("[data-encrypted-payload]");
    var form = root.querySelector("[data-encrypted-form]");
    var passwordInput = root.querySelector("[data-encrypted-password]");
    var submitButton = root.querySelector("[data-encrypted-submit]");
    var status = root.querySelector("[data-encrypted-status]");
    var target = root.querySelector("[data-encrypted-target]");

    if (!payloadNode || !form || !passwordInput || !submitButton || !status || !target) {
      return;
    }

    if (!window.crypto || !window.crypto.subtle) {
      passwordInput.disabled = true;
      submitButton.disabled = true;
      showStatus(status, "当前浏览器不支持安全解密所需的 Web Crypto API。");
      return;
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      showStatus(status, "");

      var password = passwordInput.value;
      if (!password) {
        showStatus(status, "请输入密码。");
        return;
      }

      passwordInput.disabled = true;
      submitButton.disabled = true;
      submitButton.textContent = "解锁中...";

      try {
        var payload = JSON.parse(payloadNode.textContent);
        var unlockedHtml = await decryptHtml(password, payload);
        var unlockedContent = document.createElement("div");
        unlockedContent.innerHTML = unlockedHtml;
        var fragment = document.createDocumentFragment();
        while (unlockedContent.firstChild) {
          fragment.appendChild(unlockedContent.firstChild);
        }
        passwordInput.value = "";
        root.replaceWith(fragment);
        document.dispatchEvent(new CustomEvent("encrypted-content:unlocked", { detail: { root: root } }));
      } catch (error) {
        passwordInput.disabled = false;
        submitButton.disabled = false;
        submitButton.textContent = "解锁";
        passwordInput.focus();
        showStatus(status, "解锁失败，请检查密码后重试。");
      }
    });
  }

  document.querySelectorAll("[data-encrypted-content]").forEach(setupEncryptedContent);
}());
