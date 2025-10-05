// // src/components/Message.js
// let timer = null;

// export function showMessage(text = "", duration = 2000) {
//   let el = document.getElementById("__mini_toast__");
//   if (!el) {
//     el = document.createElement("div");
//     el.id = "__mini_toast__";
//     el.style.cssText =
//       "position:fixed;left:50%;top:12px;transform:translateX(-50%);padding:8px 12px;border-radius:8px;background:rgba(0,0,0,.75);color:#fff;z-index:9999;font-size:14px;max-width:80%;";
//     document.body.appendChild(el);
//   }
//   el.textContent = text;
//   el.style.opacity = "1";
//   clearTimeout(timer);
//   timer = setTimeout(() => (el.style.opacity = "0"), duration);
// }


// 整个好看的消息提示，1秒后自动确认并消失的那种