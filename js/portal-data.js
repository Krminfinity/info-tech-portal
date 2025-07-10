// 講義ポータル データ管理ライブラリ

class PortalDataManager {
  constructor() {
    this.storageKeys = {
      courses: 'portal_courses',
      content: 'portal_content',
      links: 'portal_links'
    };
    this.jsonDataLoaded = false;
    this.jsonData = null;
  }

  // JSONファイルからデータを読み込み
  async loadJSONData() {
    if (this.jsonDataLoaded && this.jsonData) {
      return this.jsonData;
    }

    try {
      const response = await fetch('/info-tech-portal/data/portal-data.json');
      if (response.ok) {
        this.jsonData = await response.json();
        this.jsonDataLoaded = true;
        console.log('JSONデータを読み込みました:', this.jsonData);
        return this.jsonData;
      } else {
        console.warn('JSONファイルの読み込みに失敗しました。LocalStorageのデータを使用します。');
        return null;
      }
    } catch (error) {
      console.warn('JSONファイルの読み込み中にエラーが発生しました:', error);
      return null;
    }
  }

  // 講義データ取得（JSONファイル優先、フォールバックはLocalStorage）
  async getCourses() {
    const jsonData = await this.loadJSONData();
    if (jsonData && jsonData.courses) {
      return jsonData.courses;
    }
    
    // フォールバック：LocalStorage
    const localData = JSON.parse(localStorage.getItem(this.storageKeys.courses) || '[]');
    if (localData.length > 0) {
      return localData;
    }
    
    // デフォルトデータ
    return this.getDefaultCourses();
  }

  // コンテンツデータ取得
  async getContent(courseId = null) {
    const jsonData = await this.loadJSONData();
    if (jsonData && jsonData.content) {
      return courseId ? (jsonData.content[courseId] || []) : jsonData.content;
    }
    
    // フォールバック：LocalStorage
    const content = JSON.parse(localStorage.getItem(this.storageKeys.content) || '{}');
    return courseId ? (content[courseId] || []) : content;
  }

  // リンクデータ取得
  async getLinks(courseId = null, type = null) {
    const jsonData = await this.loadJSONData();
    if (jsonData && jsonData.links) {
      let links = jsonData.links;
      
      if (courseId) {
        links = links.filter(link => link.courseId === courseId);
      }
      
      if (type) {
        links = links.filter(link => link.type === type);
      }
      
      return links;
    }
    
    // フォールバック：LocalStorage
    const links = JSON.parse(localStorage.getItem(this.storageKeys.links) || '[]');
    let filteredLinks = links;
    
    if (courseId) {
      filteredLinks = filteredLinks.filter(link => link.courseId === courseId);
    }
    
    if (type) {
      filteredLinks = filteredLinks.filter(link => link.type === type);
    }
    
    return filteredLinks;
  }

  // 講義一覧をHTMLで生成
  async generateCoursesHTML() {
    const courses = await this.getCourses();
    
    if (courses.length === 0) {
      return this.getDefaultCoursesHTML();
    }

    let pcHTML = '';
    let mobileHTML = '';

    courses.forEach(course => {
      const courseCard = `
        <div class="col-md-6">
          <div class="course-card">
            <div class="text-center">
              <i class="${course.icon || 'fas fa-book'} fa-3x text-primary mb-3"></i>
              <h3>${course.name}</h3>
              <p class="text-muted mb-3">${course.description || ''}</p>
              <a href="/info-tech-portal/${course.folder}/index.html" class="btn btn-custom w-100">
                <i class="fas fa-arrow-right me-2"></i>講義に参加
              </a>
            </div>
          </div>
        </div>
      `;

      const mobileCourseCard = `
        <div class="course-card">
          <div class="text-center">
            <i class="${course.icon || 'fas fa-book'} fa-2x text-primary mb-3"></i>
            <h4>${course.name}</h4>
            <p class="text-muted mb-3">${course.description || ''}</p>
            <a href="/info-tech-portal/${course.folder}/index.html" class="btn btn-custom w-100">
              <i class="fas fa-arrow-right me-2"></i>講義に参加
            </a>
          </div>
        </div>
      `;

      pcHTML += courseCard;
      mobileHTML += mobileCourseCard;
    });

    return { pcHTML, mobileHTML };
  }

  // デフォルトの講義HTML（既存のもの）
  getDefaultCoursesHTML() {
    const pcHTML = `
      <div class="col-md-6">
        <div class="course-card">
          <div class="text-center">
            <i class="fas fa-laptop-code fa-3x text-primary mb-3"></i>
            <h3>情報技術Ⅱ</h3>
            <p class="text-muted mb-3">プログラミング基礎とアルゴリズム</p>
            <a href="/info-tech-portal/information_technology_2/index.html" class="btn btn-custom w-100">
              <i class="fas fa-arrow-right me-2"></i>講義に参加
            </a>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="course-card">
          <div class="text-center">
            <i class="fas fa-database fa-3x text-primary mb-3"></i>
            <h3>情報技術Ⅲ</h3>
            <p class="text-muted mb-3">データベースとWebアプリケーション</p>
            <a href="/info-tech-portal/information_technology_3/index.html" class="btn btn-custom w-100">
              <i class="fas fa-arrow-right me-2"></i>講義に参加
            </a>
          </div>
        </div>
      </div>
    `;

    const mobileHTML = `
      <div class="course-card">
        <div class="text-center">
          <i class="fas fa-laptop-code fa-2x text-primary mb-3"></i>
          <h4>情報技術Ⅱ</h4>
          <p class="text-muted mb-3">プログラミング基礎とアルゴリズム</p>
          <a href="/info-tech-portal/information_technology_2/index.html" class="btn btn-custom w-100">
            <i class="fas fa-arrow-right me-2"></i>講義に参加
          </a>
        </div>
      </div>
      
      <div class="course-card">
        <div class="text-center">
          <i class="fas fa-database fa-2x text-primary mb-3"></i>
          <h4>情報技術Ⅲ</h4>
          <p class="text-muted mb-3">データベースとWebアプリケーション</p>
          <a href="/info-tech-portal/information_technology_3/index.html" class="btn btn-custom w-100">
            <i class="fas fa-arrow-right me-2"></i>講義に参加
          </a>
        </div>
      </div>
    `;

    return { pcHTML, mobileHTML };
  }

  // ナビゲーションメニューを生成
  generateNavigationHTML(currentPage = '') {
    const courses = this.getCourses();
    
    let navHTML = `
      <li class="nav-item">
        <a class="nav-link ${currentPage === 'home' ? 'active' : ''}" ${currentPage === 'home' ? 'aria-current="page"' : ''} href="/info-tech-portal/index.html">Home</a>
      </li>
    `;

    if (courses.length === 0) {
      // デフォルトのナビゲーション
      navHTML += `
        <li class="nav-item">
          <a class="nav-link ${currentPage === 'information_technology_2' ? 'active' : ''}" ${currentPage === 'information_technology_2' ? 'aria-current="page"' : ''} href="/info-tech-portal/information_technology_2/index.html">情報技術II</a>
        </li>
        <li class="nav-item">
          <a class="nav-link ${currentPage === 'information_technology_3' ? 'active' : ''}" ${currentPage === 'information_technology_3' ? 'aria-current="page"' : ''} href="/info-tech-portal/information_technology_3/index.html">情報技術III</a>
        </li>
      `;
    } else {
      courses.forEach(course => {
        const isActive = currentPage === course.folder;
        navHTML += `
          <li class="nav-item">
            <a class="nav-link ${isActive ? 'active' : ''}" ${isActive ? 'aria-current="page"' : ''} href="/info-tech-portal/${course.folder}/index.html">${course.name}</a>
          </li>
        `;
      });
    }

    return navHTML;
  }

  // 講義ページのコンテンツを生成
  generateCourseContentHTML(courseId) {
    const content = this.getContent(courseId);
    const links = this.getLinks(courseId);
    
    let html = '';
    
    // コンテンツセクション
    if (content.length > 0) {
      html += '<section><h2><i class="fas fa-book-open me-3"></i>講義資料</h2><div class="row g-4">';
      
      content.forEach(item => {
        html += `
          <div class="col-md-6">
            <div class="resource-card">
              <div class="text-center">
                <i class="fas fa-file-alt fa-2x text-primary mb-3"></i>
                <h4>${item.title}</h4>
                <a href="${item.url}" class="btn btn-custom w-100">
                  <i class="fas fa-external-link-alt me-2"></i>開く
                </a>
              </div>
            </div>
          </div>
        `;
      });
      
      html += '</div></section>';
    }
    
    // リンクセクション
    if (links.length > 0) {
      html += '<section><h2><i class="fas fa-link me-3"></i>関連リンク</h2><div class="row g-4">';
      
      links.forEach(link => {
        html += `
          <div class="col-md-6">
            <div class="resource-card">
              <div class="text-center">
                <i class="fas fa-external-link-alt fa-2x text-primary mb-3"></i>
                <h4>${link.title}</h4>
                <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn btn-custom w-100">
                  <i class="fas fa-external-link-alt me-2"></i>開く
                </a>
              </div>
            </div>
          </div>
        `;
      });
      
      html += '</div></section>';
    }
    
    return html;
  }

  // デフォルト講義データ
  getDefaultCourses() {
    return [
      {
        "id": "info_tech_2",
        "name": "情報技術II",
        "description": "プログラミング基礎とアルゴリズム",
        "icon": "fas fa-laptop-code",
        "folder": "information_technology_2"
      },
      {
        "id": "info_tech_3",
        "name": "情報技術III",
        "description": "データベースとWebアプリケーション",
        "icon": "fas fa-database",
        "folder": "information_technology_3"
      }
    ];
  }

  // 講義フォルダ名から講義IDを取得（非同期対応）
  async getCourseIdByFolder(folderName) {
    const courses = await this.getCourses();
    const course = courses.find(c => c.folder === folderName);
    return course ? course.id : null;
  }

  // 講義IDから講義情報を取得（非同期対応）
  async getCourseById(courseId) {
    const courses = await this.getCourses();
    return courses.find(c => c.id === courseId);
  }
}

// グローバルインスタンス
window.portalData = new PortalDataManager();
