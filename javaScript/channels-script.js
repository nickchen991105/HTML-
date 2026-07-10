import { auth, db } from "./index-script-firebase-config.js";
import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


async function loadChannelContents() {
    const container = document.getElementById('firebase-loading');

    try {
        const q = query(collection(db, "channels-data"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        container.innerHTML = "";

        if (querySnapshot.empty) {
            container.innerHTML = `<div style="color: aliceblue; text-align: center; padding: 50px;">目前還沒有任何發想內容。</div>`;
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            let displayImg = "./img/{FF333F3D-D207-42D2-997C-41F33815D4E7}.png";

       if (data.imgUrl && data.imgUrl.startsWith("http")) {
        let url = data.imgUrl;

        // 如果發現使用者貼的是 Google Drive 的網頁分享連結
        if (url.includes("drive.google.com")) {
            // ✅ 徹底修正後的正則表達式：精準抽取出 /d/ 後面的圖片 ID
            const matches = url.match(/\/d\/([^/]+)/);
            if (matches && matches[1]) {
                const imageId = matches[1];
                // 🛠️ 轉換成 Google 官方目前最穩定的直連網址（修正樣板字串中的 $ 符號）
                displayImg = `https://lh3.googleusercontent.com/d/${imageId}`;
            }
        } else {
            // 如果是一般的普通網路圖片網址，就直接沿用
            displayImg = url;
        }
    }
            

            container.innerHTML += `
                <div class="project-block">
                    <div class="img-style" class="project-img-wrapper">
                        <img src="${displayImg}">
                    </div>
                    <div class="channels-text project-content-wrapper">
                        <h1>&emsp;${data.title}</h1>
                        <p class="text-wrapper">${data.content.replace(/\n/g, '<br>&emsp;&emsp;')}</p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("撈取資料失敗：", error);
        container.innerHTML = `<div style="color: red; text-align: center; padding: 50px;">資料載入失敗：${error.message}</div>`;
    }
}

window.onload = loadChannelContents;