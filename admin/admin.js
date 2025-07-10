// 管理画面のJavaScript

// パスワード（実際の運用では環境変数やより安全な方法を使用）
const ADMIN_PASSWORD = 'admin123';

// データ保存キー
const STORAGE_KEYS = {
  courses: 'portal_courses',
  content: 'portal_content',
  links: 'portal_links',
  classContent: 'portal_class_content',
  classLinks: 'portal_class_links',
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

  // 資料・リンク保存
  document.getElementById('saveContent').addEventListener('click', saveContent);
  document.getElementById('saveLink').addEventListener('click', saveLink);

  // 講義選択
  document.getElementById('courseSelect').addEventListener('change', loadCourseContent);
  document.getElementById('linkCourseSelect').addEventListener('change', loadCourseLinks);
  
  // コンテンツタイプ選択
  document.getElementById('contentTypeSelect').addEventListener('change', loadCourseContent);
  document.getElementById('linkTypeSelect').addEventListener('change', loadCourseLinks);
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

// 資料保存機能
function saveContent() {
  try {
    console.log('saveContent 関数が呼び出されました');
    
    const courseSelect = document.getElementById('courseSelect');
    const contentTypeSelect = document.getElementById('contentTypeSelect');
    const selectedCourse = courseSelect.value;
    const contentType = contentTypeSelect.value;
    
    console.log('選択された講義:', selectedCourse);
    console.log('コンテンツタイプ:', contentType);
    
    // バリデーション
    if (!selectedCourse) {
      alert('講義を選択してください。');
      return;
    }
    
    const title = document.getElementById('contentTitle').value.trim();
    const url = document.getElementById('contentUrl').value.trim();
    const category = document.getElementById('contentCategory').value;
    
    if (!title) {
      alert('タイトルを入力してください。');
      document.getElementById('contentTitle').focus();
      return;
    }
    
    if (!url) {
      alert('URLを入力してください。');
      document.getElementById('contentUrl').focus();
      return;
    }
    
    if (!category) {
      alert('カテゴリを選択してください。');
      document.getElementById('contentCategory').focus();
      return;
    }
    
    const content = {
      id: document.getElementById('contentId').value || generateId(),
      title: title,
      url: url,
      description: document.getElementById('contentDescription').value.trim(),
      category: category,
      order: parseInt(document.getElementById('contentOrder').value) || 1,
      courseId: selectedCourse,
      type: contentType,
      createdAt: new Date().toISOString()
    };
    
    console.log('保存するコンテンツ:', content);
    
    let allContent = JSON.parse(localStorage.getItem(STORAGE_KEYS.content) || '[]');
    console.log('既存のコンテンツ数:', allContent.length);
    
    // 既存の資料を更新または新規追加
    const existingIndex = allContent.findIndex(c => c.id === content.id);
    if (existingIndex >= 0) {
      allContent[existingIndex] = content;
      console.log('既存のコンテンツを更新しました');
    } else {
      allContent.push(content);
      console.log('新しいコンテンツを追加しました');
    }
    
    localStorage.setItem(STORAGE_KEYS.content, JSON.stringify(allContent));
    console.log('LocalStorageに保存完了');
    
    // フォームをクリア
    document.getElementById('contentForm').reset();
    document.getElementById('contentId').value = '';
    document.getElementById('contentOrder').value = '1';
    
    // モーダルを閉じる
    const modal = bootstrap.Modal.getInstance(document.getElementById('contentModal'));
    if (modal) {
      modal.hide();
    }
    
    // リストを更新
    loadCourseContent();
    
    alert(`資料「${content.title}」が保存されました。`);
    
  } catch (error) {
    console.error('保存中にエラーが発生しました:', error);
    alert('保存中にエラーが発生しました。コンソールを確認してください。');
  }
}

// リンク保存機能
function saveLink() {
  try {
    console.log('saveLink 関数が呼び出されました');
    
    const courseSelect = document.getElementById('linkCourseSelect');
    const linkTypeSelect = document.getElementById('linkTypeSelect');
    const selectedCourse = courseSelect.value;
    const linkType = linkTypeSelect.value;
    
    console.log('選択された講義:', selectedCourse);
    console.log('リンクタイプ:', linkType);
    
    // バリデーション
    if (!selectedCourse) {
      alert('講義を選択してください。');
      return;
    }
    
    const title = document.getElementById('linkTitle').value.trim();
    const url = document.getElementById('linkUrl').value.trim();
    
    if (!title) {
      alert('タイトルを入力してください。');
      document.getElementById('linkTitle').focus();
      return;
    }
    
    if (!url) {
      alert('URLを入力してください。');
      document.getElementById('linkUrl').focus();
      return;
    }
    
    const link = {
      id: document.getElementById('linkId').value || generateId(),
      title: title,
      url: url,
      description: document.getElementById('linkDescription').value.trim(),
      newTab: document.getElementById('linkNewTab').checked,
      order: parseInt(document.getElementById('linkOrder').value) || 1,
      courseId: selectedCourse,
      type: linkType,
      createdAt: new Date().toISOString()
    };
    
    console.log('保存するリンク:', link);
    
    let allLinks = JSON.parse(localStorage.getItem(STORAGE_KEYS.links) || '[]');
    console.log('既存のリンク数:', allLinks.length);
    
    // 既存のリンクを更新または新規追加
    const existingIndex = allLinks.findIndex(l => l.id === link.id);
    if (existingIndex >= 0) {
      allLinks[existingIndex] = link;
      console.log('既存のリンクを更新しました');
    } else {
      allLinks.push(link);
      console.log('新しいリンクを追加しました');
    }
    
    localStorage.setItem(STORAGE_KEYS.links, JSON.stringify(allLinks));
    console.log('LocalStorageに保存完了');
    
    // フォームをクリア
    document.getElementById('linkForm').reset();
    document.getElementById('linkId').value = '';
    document.getElementById('linkOrder').value = '1';
    document.getElementById('linkNewTab').checked = true;
    
    // モーダルを閉じる
    const modal = bootstrap.Modal.getInstance(document.getElementById('linkModal'));
    if (modal) {
      modal.hide();
    }
    
    // リストを更新
    loadCourseLinks();
    
    alert(`リンク「${link.title}」が保存されました。`);
    
  } catch (error) {
    console.error('保存中にエラーが発生しました:', error);
    alert('保存中にエラーが発生しました。コンソールを確認してください。');
  }
}

// ユニークID生成関数
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 拡張されたコンテンツ読み込み機能
function loadCourseContent() {
  console.log('loadCourseContent 関数が呼び出されました');
  
  const selectedCourse = document.getElementById('courseSelect').value;
  const contentType = document.getElementById('contentTypeSelect').value;
  const contentDiv = document.getElementById('contentManagement');
  
  console.log('選択された講義:', selectedCourse);
  console.log('コンテンツタイプ:', contentType);
  
  if (!selectedCourse) {
    contentDiv.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>講義を選択してください。</div>';
    return;
  }
  
  const allContent = JSON.parse(localStorage.getItem(STORAGE_KEYS.content) || '[]');
  console.log('全コンテンツ数:', allContent.length);
  
  const courseContent = allContent.filter(c => c.courseId === selectedCourse && c.type === contentType);
  console.log('フィルタされたコンテンツ数:', courseContent.length);
  
  if (courseContent.length === 0) {
    contentDiv.innerHTML = `
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle me-2"></i>
        この講義の${getContentTypeLabel(contentType)}はまだありません。<br>
        「資料を追加」ボタンから新しい資料を追加してください。
      </div>`;
    return;
  }
  
  // 表示順序でソート（確認テストは最後に）
  courseContent.sort((a, b) => {
    if (a.category === 'exam' && b.category !== 'exam') return 1;
    if (a.category !== 'exam' && b.category === 'exam') return -1;
    return a.order - b.order;
  });
  
  let html = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6><i class="fas fa-file-alt me-2"></i>${getContentTypeLabel(contentType)} (${courseContent.length}件)</h6>
      <small class="text-muted">最終更新: ${new Date().toLocaleString()}</small>
    </div>
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th width="80">順序</th>
            <th>タイトル</th>
            <th width="120">カテゴリ</th>
            <th width="100">URL</th>
            <th width="150">操作</th>
          </tr>
        </thead>
        <tbody>`;
  
  courseContent.forEach(content => {
    const categoryBadge = getCategoryBadge(content.category);
    html += `
      <tr>
        <td><span class="badge bg-secondary">${content.order}</span></td>
        <td>
          <strong>${content.title}</strong>
          ${content.description ? `<br><small class="text-muted">${content.description}</small>` : ''}
        </td>
        <td>${categoryBadge}</td>
        <td><a href="${content.url}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="fas fa-external-link-alt"></i></a></td>
        <td>
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-warning" onclick="editContent('${content.id}')" title="編集">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteContent('${content.id}')" title="削除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>`;
  });
  
  html += '</tbody></table></div>';
  contentDiv.innerHTML = html;
}

// 拡張されたリンク読み込み機能
function loadCourseLinks() {
  console.log('loadCourseLinks 関数が呼び出されました');
  
  const selectedCourse = document.getElementById('linkCourseSelect').value;
  const linkType = document.getElementById('linkTypeSelect').value;
  const linkDiv = document.getElementById('linkManagement');
  
  console.log('選択された講義:', selectedCourse);
  console.log('リンクタイプ:', linkType);
  
  if (!selectedCourse) {
    linkDiv.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>講義を選択してください。</div>';
    return;
  }
  
  const allLinks = JSON.parse(localStorage.getItem(STORAGE_KEYS.links) || '[]');
  console.log('全リンク数:', allLinks.length);
  
  const courseLinks = allLinks.filter(l => l.courseId === selectedCourse && l.type === linkType);
  console.log('フィルタされたリンク数:', courseLinks.length);
  
  if (courseLinks.length === 0) {
    linkDiv.innerHTML = `
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle me-2"></i>
        この講義の${getContentTypeLabel(linkType)}はまだありません。<br>
        「リンクを追加」ボタンから新しいリンクを追加してください。
      </div>`;
    return;
  }
  
  // 表示順序でソート
  courseLinks.sort((a, b) => a.order - b.order);
  
  let html = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6><i class="fas fa-link me-2"></i>${getContentTypeLabel(linkType)} (${courseLinks.length}件)</h6>
      <small class="text-muted">最終更新: ${new Date().toLocaleString()}</small>
    </div>
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th width="80">順序</th>
            <th>タイトル</th>
            <th>説明</th>
            <th width="100">URL</th>
            <th width="100">新しいタブ</th>
            <th width="150">操作</th>
          </tr>
        </thead>
        <tbody>`;
  
  courseLinks.forEach(link => {
    html += `
      <tr>
        <td><span class="badge bg-secondary">${link.order}</span></td>
        <td>
          <strong>${link.title}</strong>
        </td>
        <td>${link.description || '<span class="text-muted">-</span>'}</td>
        <td><a href="${link.url}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="fas fa-external-link-alt"></i></a></td>
        <td>${link.newTab ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-muted"></i>'}</td>
        <td>
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-warning" onclick="editLink('${link.id}')" title="編集">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteLink('${link.id}')" title="削除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>`;
  });
  
  html += '</tbody></table></div>';
  linkDiv.innerHTML = html;
}

// ヘルパー関数
function getContentTypeLabel(type) {
  const labels = {
    'common': '共通資料',
    'class1': '1組専用',
    'class2': '2組専用'
  };
  return labels[type] || type;
}

function getCategoryLabel(category) {
  const labels = {
    'lecture': '講義資料',
    'exercise': '演習',
    'exam': '試験・確認テスト',
    'reference': '参考資料'
  };
  return labels[category] || category;
}

function getCategoryBadge(category) {
  const badges = {
    'lecture': '<span class="badge bg-primary">講義資料</span>',
    'exercise': '<span class="badge bg-info">演習</span>',
    'exam': '<span class="badge bg-warning text-dark">試験・確認テスト</span>',
    'reference': '<span class="badge bg-secondary">参考資料</span>'
  };
  return badges[category] || `<span class="badge bg-light text-dark">${category}</span>`;
}

// 編集・削除機能
function editContent(contentId) {
  const allContent = JSON.parse(localStorage.getItem(STORAGE_KEYS.content) || '[]');
  const content = allContent.find(c => c.id === contentId);
  
  if (content) {
    document.getElementById('contentId').value = content.id;
    document.getElementById('contentTitle').value = content.title;
    document.getElementById('contentUrl').value = content.url;
    document.getElementById('contentDescription').value = content.description || '';
    document.getElementById('contentCategory').value = content.category;
    document.getElementById('contentOrder').value = content.order;
    
    const modal = new bootstrap.Modal(document.getElementById('contentModal'));
    modal.show();
  }
}

function deleteContent(contentId) {
  if (confirm('この資料を削除しますか？')) {
    let allContent = JSON.parse(localStorage.getItem(STORAGE_KEYS.content) || '[]');
    allContent = allContent.filter(c => c.id !== contentId);
    localStorage.setItem(STORAGE_KEYS.content, JSON.stringify(allContent));
    loadCourseContent();
    alert('資料が削除されました。');
  }
}

function editLink(linkId) {
  const allLinks = JSON.parse(localStorage.getItem(STORAGE_KEYS.links) || '[]');
  const link = allLinks.find(l => l.id === linkId);
  
  if (link) {
    document.getElementById('linkId').value = link.id;
    document.getElementById('linkTitle').value = link.title;
    document.getElementById('linkUrl').value = link.url;
    document.getElementById('linkDescription').value = link.description || '';
    document.getElementById('linkNewTab').checked = link.newTab || false;
    document.getElementById('linkOrder').value = link.order;
    
    const modal = new bootstrap.Modal(document.getElementById('linkModal'));
    modal.show();
  }
}

function deleteLink(linkId) {
  if (confirm('このリンクを削除しますか？')) {
    let allLinks = JSON.parse(localStorage.getItem(STORAGE_KEYS.links) || '[]');
    allLinks = allLinks.filter(l => l.id !== linkId);
    localStorage.setItem(STORAGE_KEYS.links, JSON.stringify(allLinks));
    loadCourseLinks();
    alert('リンクが削除されました。');
  }
}
