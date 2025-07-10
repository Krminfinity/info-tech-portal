// 講義ポータル データ管理ライブラリ

class PortalDataManager {
  constructor() {
    this.storageKeys = {
      courses: 'portal_courses',
      content: 'portal_content',
      links: 'portal_links'
    };
  }

  // 講義データ取得
  getCourses() {
    return JSON.parse(localStorage.getItem(this.storageKeys.courses) || '[]');
  }

  // コンテンツデータ取得
  getContent(courseId = null) {
    const content = JSON.parse(localStorage.getItem(this.storageKeys.content) || '{}');
    return courseId ? (content[courseId] || []) : content;
  }

  // リンクデータ取得
  getLinks(courseId = null) {
    const links = JSON.parse(localStorage.getItem(this.storageKeys.links) || '{}');
    return courseId ? (links[courseId] || []) : links;
  }

  // 講義一覧をHTMLで生成
  generateCoursesHTML() {
    const courses = this.getCourses();
    
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

  // 講義フォルダ名から講義IDを取得
  getCourseIdByFolder(folderName) {
    const courses = this.getCourses();
    const course = courses.find(c => c.folder === folderName);
    return course ? course.id : null;
  }

  // 講義IDから講義情報を取得
  getCourseById(courseId) {
    const courses = this.getCourses();
    return courses.find(c => c.id === courseId);
  }
}

// グローバルインスタンス
window.portalData = new PortalDataManager();
