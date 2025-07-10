// 管理画面のJavaScript

// パスワード（実際の運用では環境変数やより安全な方法を使用）
const ADMIN_PASSWORD = 'admin123';

// データ保存キー
const STORAGE_KEYS = {
  courses: 'portal_courses',
  content: 'portal_content',
  links: 'portal_links',
  isLoggedIn: 'portal_admin_logged_in'
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
  checkLogin();
  initializeEventListeners();
  initializeDefaultData();
  loadData();
});

// ログイン状態チェック
function checkLogin() {
  const isLoggedIn = localStorage.getItem(STORAGE_KEYS.isLoggedIn) === 'true';
  if (isLoggedIn) {
    showAdminSection();
  } else {
    showLoginSection();
  }
}

// ログイン画面表示
function showLoginSection() {
  document.getElementById('loginSection').classList.remove('d-none');
  document.getElementById('adminSection').classList.add('d-none');
}

// 管理画面表示
function showAdminSection() {
  document.getElementById('loginSection').classList.add('d-none');
  document.getElementById('adminSection').classList.remove('d-none');
}

// イベントリスナー初期化
function initializeEventListeners() {
  // ログインフォーム
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEYS.isLoggedIn, 'true');
      showAdminSection();
      document.getElementById('loginError').classList.add('d-none');
    } else {
      document.getElementById('loginError').classList.remove('d-none');
    }
  });

  // ログアウト
  document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem(STORAGE_KEYS.isLoggedIn);
    showLoginSection();
  });

  // メニュー切り替え
  document.querySelectorAll('[data-section]').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.dataset.section;
      switchSection(section);
      
      // アクティブ状態更新
      document.querySelectorAll('.list-group-item').forEach(link => {
        link.classList.remove('active');
      });
      this.classList.add('active');
    });
  });

  // 講義保存
  document.getElementById('saveCourse').addEventListener('click', saveCourse);

  // 講義選択
  document.getElementById('courseSelect').addEventListener('change', loadCourseContent);
  document.getElementById('linkCourseSelect').addEventListener('change', loadCourseLinks);
}

// セクション切り替え
function switchSection(section) {
  document.querySelectorAll('.admin-section').forEach(sec => {
    sec.classList.add('d-none');
  });
  document.getElementById(section + 'Section').classList.remove('d-none');
  
  if (section === 'courses') {
    displayCourses();
  } else if (section === 'content') {
    populateCourseSelect();
  } else if (section === 'links') {
    populateLinkCourseSelect();
  } else if (section === 'backup') {
    // バックアップセクションは特別な処理不要
  }
}

// データ読み込み
function loadData() {
  displayCourses();
  populateCourseSelect();
  populateLinkCourseSelect();
}

// 講義一覧表示
function displayCourses() {
  const courses = getCourses();
  const container = document.getElementById('coursesList');
  
  if (courses.length === 0) {
    container.innerHTML = '<p class="text-muted">講義が登録されていません。</p>';
    return;
  }
  
  let html = '<div class="row">';
  courses.forEach(course => {
    html += `
      <div class="col-md-6 mb-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">
              <i class="${course.icon || 'fas fa-book'} me-2"></i>
              ${course.name}
            </h5>
            <p class="card-text">${course.description || ''}</p>
            <small class="text-muted">フォルダ: ${course.folder}</small>
            <div class="mt-2">
              <button class="btn btn-sm btn-outline-primary" onclick="editCourse('${course.id}')">
                <i class="fas fa-edit me-1"></i>編集
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteCourse('${course.id}')">
                <i class="fas fa-trash me-1"></i>削除
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

// 講義データ取得
function getCourses() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.courses) || '[]');
}

// 講義データ保存
function saveCourses(courses) {
  localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(courses));
}

// 講義保存
function saveCourse() {
  const form = document.getElementById('courseForm');
  const formData = new FormData(form);
  
  const course = {
    id: document.getElementById('courseId').value || Date.now().toString(),
    name: document.getElementById('courseName').value,
    description: document.getElementById('courseDescription').value,
    icon: document.getElementById('courseIcon').value,
    folder: document.getElementById('courseFolder').value
  };
  
  let courses = getCourses();
  const existingIndex = courses.findIndex(c => c.id === course.id);
  
  if (existingIndex >= 0) {
    courses[existingIndex] = course;
  } else {
    courses.push(course);
  }
  
  saveCourses(courses);
  
  // モーダルを閉じる
  const modal = bootstrap.Modal.getInstance(document.getElementById('courseModal'));
  modal.hide();
  
  // フォームリセット
  form.reset();
  document.getElementById('courseId').value = '';
  
  // 一覧更新
  displayCourses();
  populateCourseSelect();
  populateLinkCourseSelect();
  
  alert('講義が保存されました。');
}

// 講義編集
function editCourse(id) {
  const courses = getCourses();
  const course = courses.find(c => c.id === id);
  
  if (course) {
    document.getElementById('courseId').value = course.id;
    document.getElementById('courseName').value = course.name;
    document.getElementById('courseDescription').value = course.description || '';
    document.getElementById('courseIcon').value = course.icon || '';
    document.getElementById('courseFolder').value = course.folder;
    
    const modal = new bootstrap.Modal(document.getElementById('courseModal'));
    modal.show();
  }
}

// 講義削除
function deleteCourse(id) {
  if (confirm('この講義を削除しますか？関連するコンテンツも削除されます。')) {
    let courses = getCourses();
    courses = courses.filter(c => c.id !== id);
    saveCourses(courses);
    
    // 関連データも削除
    const content = getContent();
    delete content[id];
    saveContent(content);
    
    const links = getLinks();
    delete links[id];
    saveLinks(links);
    
    displayCourses();
    populateCourseSelect();
    populateLinkCourseSelect();
    
    alert('講義が削除されました。');
  }
}

// 講義選択肢を更新
function populateCourseSelect() {
  const courses = getCourses();
  const select = document.getElementById('courseSelect');
  
  select.innerHTML = '<option value="">講義を選択してください</option>';
  courses.forEach(course => {
    select.innerHTML += `<option value="${course.id}">${course.name}</option>`;
  });
}

function populateLinkCourseSelect() {
  const courses = getCourses();
  const select = document.getElementById('linkCourseSelect');
  
  select.innerHTML = '<option value="">講義を選択してください</option>';
  courses.forEach(course => {
    select.innerHTML += `<option value="${course.id}">${course.name}</option>`;
  });
}

// コンテンツ管理
function loadCourseContent() {
  const courseId = document.getElementById('courseSelect').value;
  const container = document.getElementById('contentManagement');
  
  if (!courseId) {
    container.innerHTML = '';
    return;
  }
  
  const content = getContent();
  const courseContent = content[courseId] || [];
  
  let html = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6>コンテンツ一覧</h6>
      <button class="btn btn-success btn-sm" onclick="addContent('${courseId}')">
        <i class="fas fa-plus me-1"></i>追加
      </button>
    </div>
  `;
  
  if (courseContent.length === 0) {
    html += '<p class="text-muted">コンテンツが登録されていません。</p>';
  } else {
    html += '<div class="list-group">';
    courseContent.forEach((item, index) => {
      html += `
        <div class="list-group-item">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-1">${item.title}</h6>
              <small class="text-muted">${item.type} - ${item.url}</small>
            </div>
            <div>
              <button class="btn btn-sm btn-outline-primary" onclick="editContent('${courseId}', ${index})">編集</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteContent('${courseId}', ${index})">削除</button>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
  }
  
  container.innerHTML = html;
}

// コンテンツデータ取得/保存
function getContent() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.content) || '{}');
}

function saveContent(content) {
  localStorage.setItem(STORAGE_KEYS.content, JSON.stringify(content));
}

// リンク管理
function loadCourseLinks() {
  const courseId = document.getElementById('linkCourseSelect').value;
  const container = document.getElementById('linkManagement');
  
  if (!courseId) {
    container.innerHTML = '';
    return;
  }
  
  const links = getLinks();
  const courseLinks = links[courseId] || [];
  
  let html = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6>リンク一覧</h6>
      <button class="btn btn-success btn-sm" onclick="addLink('${courseId}')">
        <i class="fas fa-plus me-1"></i>追加
      </button>
    </div>
  `;
  
  if (courseLinks.length === 0) {
    html += '<p class="text-muted">リンクが登録されていません。</p>';
  } else {
    html += '<div class="list-group">';
    courseLinks.forEach((link, index) => {
      html += `
        <div class="list-group-item">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-1">${link.title}</h6>
              <small class="text-muted">${link.url}</small>
            </div>
            <div>
              <button class="btn btn-sm btn-outline-primary" onclick="editLink('${courseId}', ${index})">編集</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteLink('${courseId}', ${index})">削除</button>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
  }
  
  container.innerHTML = html;
}

// リンクデータ取得/保存
function getLinks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.links) || '{}');
}

function saveLinks(links) {
  localStorage.setItem(STORAGE_KEYS.links, JSON.stringify(links));
}

// コンテンツ追加/編集用の関数（簡略化）
function addContent(courseId) {
  const title = prompt('コンテンツタイトル:');
  if (!title) return;
  
  const type = prompt('タイプ (class, resource, etc.):') || 'resource';
  const url = prompt('URL:');
  if (!url) return;
  
  const content = getContent();
  if (!content[courseId]) content[courseId] = [];
  content[courseId].push({ title, type, url });
  saveContent(content);
  loadCourseContent();
}

function editContent(courseId, index) {
  const content = getContent();
  const item = content[courseId][index];
  
  const title = prompt('コンテンツタイトル:', item.title);
  if (!title) return;
  
  const type = prompt('タイプ (class, resource, etc.):', item.type);
  const url = prompt('URL:', item.url);
  if (!url) return;
  
  content[courseId][index] = { title, type, url };
  saveContent(content);
  loadCourseContent();
}

function deleteContent(courseId, index) {
  if (confirm('このコンテンツを削除しますか？')) {
    const content = getContent();
    content[courseId].splice(index, 1);
    saveContent(content);
    loadCourseContent();
  }
}

function addLink(courseId) {
  const title = prompt('リンクタイトル:');
  if (!title) return;
  
  const url = prompt('URL:');
  if (!url) return;
  
  const links = getLinks();
  if (!links[courseId]) links[courseId] = [];
  links[courseId].push({ title, url });
  saveLinks(links);
  loadCourseLinks();
}

function editLink(courseId, index) {
  const links = getLinks();
  const link = links[courseId][index];
  
  const title = prompt('リンクタイトル:', link.title);
  if (!title) return;
  
  const url = prompt('URL:', link.url);
  if (!url) return;
  
  links[courseId][index] = { title, url };
  saveLinks(links);
  loadCourseLinks();
}

function deleteLink(courseId, index) {
  if (confirm('このリンクを削除しますか？')) {
    const links = getLinks();
    links[courseId].splice(index, 1);
    saveLinks(links);
    loadCourseLinks();
  }
}

// データエクスポート用関数
function exportData() {
  const data = {
    courses: getCourses(),
    content: getContent(),
    links: getLinks()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'portal_data.json';
  a.click();
  URL.revokeObjectURL(url);
}

// GitHub Pages用JSONを生成
function exportToGitHub() {
  const data = {
    courses: getCourses(),
    content: getContent(),
    links: getLinks()
  };
  
  const jsonString = JSON.stringify(data, null, 2);
  document.getElementById('githubJson').value = jsonString;
  
  alert('GitHub Pages用のJSONデータが生成されました。テキストエリアの内容をコピーして、/data/portal-data.jsonファイルに保存してください。');
}

// クリップボードにコピー
function copyToClipboard() {
  const textarea = document.getElementById('githubJson');
  if (textarea.value) {
    textarea.select();
    document.execCommand('copy');
    alert('クリップボードにコピーされました！');
  } else {
    alert('先にデータを生成してください。');
  }
}

// データインポート用関数
function importData(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        if (data.courses) saveCourses(data.courses);
        if (data.content) saveContent(data.content);
        if (data.links) saveLinks(data.links);
        alert('データがインポートされました。');
        loadData();
      } catch (error) {
        alert('データの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  }
}

// デフォルトデータ初期化
function initializeDefaultData() {
  const courses = getCourses();
  if (courses.length === 0) {
    const defaultCourses = [
      {
        id: 'info_tech_2',
        name: '情報技術II',
        description: 'プログラミング基礎とアルゴリズム',
        icon: 'fas fa-laptop-code',
        folder: 'information_technology_2'
      },
      {
        id: 'info_tech_3',
        name: '情報技術III',
        description: 'データベースとWebアプリケーション',
        icon: 'fas fa-database',
        folder: 'information_technology_3'
      }
    ];
    
    saveCourses(defaultCourses);
    
    // デフォルトコンテンツも追加
    const defaultContent = {
      'info_tech_2': [
        {
          title: '第1回 講義資料',
          type: 'class',
          url: '/info-tech-portal/information_technology_2/class1.html'
        },
        {
          title: '第2回 講義資料',
          type: 'class',
          url: '/info-tech-portal/information_technology_2/class2.html'
        }
      ],
      'info_tech_3': [
        {
          title: '第1回 講義資料',
          type: 'class',
          url: '/info-tech-portal/information_technology_3/class1.html'
        },
        {
          title: '第2回 講義資料',
          type: 'class',
          url: '/info-tech-portal/information_technology_3/class2.html'
        }
      ]
    };
    
    saveContent(defaultContent);
  }
}

// デフォルトにリセット
function resetToDefault() {
  if (confirm('全てのデータが削除され、デフォルトの講義データに戻されます。この操作は取り消せません。続行しますか？')) {
    // 全データを削除
    localStorage.removeItem(STORAGE_KEYS.courses);
    localStorage.removeItem(STORAGE_KEYS.content);
    localStorage.removeItem(STORAGE_KEYS.links);
    
    // デフォルトデータを再作成
    initializeDefaultData();
    
    // 画面を更新
    loadData();
    
    alert('デフォルトデータにリセットされました。');
  }
}
