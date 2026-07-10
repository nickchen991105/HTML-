
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { auth, db } from "./index-script-firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

let unsubscribeList = null;

onAuthStateChanged(auth, (user) =>{
    if (user) {
        const panel = document.getElementById("admin-panel");
    panel.innerHTML = `
      <h2 class="channels-text">管理員部落格後台</h2>
       
      &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
       &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;

      <input type="text" id="title" placeholder="請輸入發想標題">
      <textarea id="content" placeholder="請輸入點子內容"></textarea>
      <textarea id="img-url-input" placeholder="請輸入img url"></textarea>
      <button onclick="uploadIdea()">發布到「正在嘗試分頁」</button>
      <button onclick="handleLogout()">登出</button>
      <br><br><br>
     <h3 class="channels-text">目前已儲存的發想內容</h3>
     <br><br><br>
      <div id="idea-list" style="color: aliceblue; text-align: left; max-width: 600px; margin: 0 auto;">
         載入列表中...
      </div>
      
    `;
    
    
    // 顯示後台、隱藏 Loading
    panel.style.display = "block";
    document.getElementById("loading").style.display = "none";

    initIdeaList();

  } else {
    // ❌ 2. 沒登入，直接踹走，他什麼都看不到
    window.location.href = "../index.html";
    }
} )


window.handleLogout = async function() {
  try {
    await signOut(auth); // 🪐 銷毀 LocalStorage 的 Token
    alert("登出成功！");
    window.location.href = "../index.html"; // 踹回登入頁（請確認你的 index.html 相對路徑對不對）
  } catch (error) {
    console.error("登出失敗：", error);
  }
};


function initIdeaList() {
  const listContainer = document.getElementById('idea-list');
  const q = query(collection(db, "channels-data"), orderBy("createdAt", "desc"));

  unsubscribeList = onSnapshot(q, (querySnapshot) =>{
    console.log("收到來自 Firestore 的資料更新，總筆數:", querySnapshot.size);

    if (querySnapshot.empty) {
      listContainer.innerHTML = "<p>空</p>";
       return;
    }
    let htmlContant = "";
    querySnapshot.forEach((doc) => {
            const data = doc.data();
            htmlContant += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px dashed #444;">
                    <span style="font-size: 18px; font-weight: bold;">${data.title || "無標題"}</span>
                    <button onclick="deleteIdea('${doc.id}', '${data.title}')" style="background-color: #ff333f; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                        刪除
                    </button>
                </div>
            `;
        });
        listContainer.innerHTML = htmlContant;
  }, (error) => {
        console.error("監聽列表失敗：", error);
        listContainer.innerHTML = "<p style='color: red;'>無法載入資料列表。</p>";
    });
}

window.deleteIdea = async function(docId, title) {
    // 彈出確認視窗防手殘
    if (!confirm(`確定要永久刪除「${title}」這份資料嗎？`)) {
        return; 
    }

    try {
        // 🚀 使用 doc(db, 集合名稱, 資料ID) 指定目標，再用 deleteDoc 砍掉
        await deleteDoc(doc(db, "channels-data", docId));
        alert(`❌ 已成功刪除「${title}」`);
        // 注意：因為上面用了 onSnapshot，這裡完全不需要手動重新渲染，畫面自己會把這一列抽掉！
    } catch (error) {
        console.error("刪除失敗：", error);
        alert("刪除失敗：" + error.message);
    }
};



window.uploadIdea = async function() {
  // 抓取畫面上輸入框的值
  const titleText = document.getElementById("title").value;
  const contentText = document.getElementById("content").value;
  const imgUrl = document.getElementById('img-url-input').value;

  if (!titleText || !contentText) {
    alert("標題和內容不能空著喔！");
    return;
  }

  try {
    // 這裡放你原本的 Firestore 上傳程式碼
    // await addDoc(collection(db, "blog_ideas"), { ... });
    await addDoc(collection(db, "channels-data"), {
            title: titleText,
            content: contentText,
            imgUrl: imgUrl,               
            createdAt: serverTimestamp() 
        });

    alert("發想上傳成功！");

    document.getElementById("title").value = "";
    document.getElementById("content").value = "";
    document.getElementById("img-url-input").value = "";

  } catch (error) {
    console.error("上傳失敗：", error);
    alert("上傳失敗：" + error.message);
  }
};

// window.uploadIdea = async function() {
//     let rawDriveUrl = document.getElementById("img-url-input").value; // 假設你後台多了一個圖片輸入框
//     let finalImageUrl = "";
//     if (rawDriveUrl.includes("drive.google.com")) {
//         // 利用正則表達式把中間那串圖片 ID 抓出來
//         const matches = rawDriveUrl.match(/\/d\/([^/]+)/);
//         if (matches && matches[1]) {
//             const imageId = matches[1];
//             // 這是 Google Drive 專用的直連格式
//             finalImageUrl = `https://lh3.googleusercontent.com/d/${imageId}`;
//         }
//     } else {
//         // 如果是普通網址或本地路徑，維持原樣
//         finalImageUrl = rawDriveUrl || "./img/default.png"; 
//     }

// };

