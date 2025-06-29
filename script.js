class ColorPicker {
  constructor() {
    this.currentColor = '#667eea';
    this.savedColors = this.loadSavedColors();
    this.isPaletteMode = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateDisplay();
    this.renderSavedColors();
    this.updateClearButtonVisibility();
  }

  bindEvents() {
    // 색상 생성 버튼
    document.getElementById('generate-btn').addEventListener('click', () => {
      this.generateRandomColor();
    });

    // 색상 저장 버튼
    document.getElementById('save-btn').addEventListener('click', () => {
      this.saveCurrentColor();
    });

    // 팔레트 모드 버튼
    document.getElementById('random-palette-btn').addEventListener('click', () => {
      this.togglePaletteMode();
    });

    // 색상 코드 복사 버튼
    document.getElementById('copy-btn').addEventListener('click', () => {
      this.copyColorCode();
    });

    // 저장된 색상 모두 삭제 버튼 - 한 번만 등록
    const clearBtn = document.getElementById('clear-saved');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearAllSavedColors();
      });
    }

    // 키보드 단축키
    document.addEventListener('click', (e) => {
    if (e.target.id === 'clear-saved') {
      this.clearAllSavedColors();
    }
  });

    // 색상 박스 클릭으로도 새 색상 생성
    document.getElementById('color-box').addEventListener('click', () => {
      this.generateRandomColor();
    });
  }

  // 랜덤 색상 생성 (개선된 알고리즘)
  generateRandomColor() {
    const colorBox = document.getElementById('color-box');
    const generateBtn = document.getElementById('generate-btn');
    
    // 애니메이션 효과
    colorBox.classList.add('generating');
    generateBtn.disabled = true;
    generateBtn.textContent = '생성 중...';

    setTimeout(() => {
      // 더 다양한 색상 생성을 위한 HSL 방식 사용
      const hue = Math.floor(Math.random() * 360);
      const saturation = 50 + Math.floor(Math.random() * 50); // 50-100%
      const lightness = 30 + Math.floor(Math.random() * 40);  // 30-70%
      
      const color = this.hslToHex(hue, saturation, lightness);
      this.currentColor = color;
      this.updateDisplay();
      this.updateBackgroundGradient();
      
      // 애니메이션 정리
      colorBox.classList.remove('generating');
      generateBtn.disabled = false;
      generateBtn.textContent = '새로운 색상 뽑기';
    }, 300);
  }

  // HSL을 HEX로 변환
  hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  // HEX를 RGB로 변환
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // 색상 밝기 계산
  getLuminance(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  // 표시 업데이트
  updateDisplay() {
    const colorBox = document.getElementById('color-box');
    const colorCode = document.getElementById('color-code');
    
    colorBox.style.background = this.currentColor;
    colorCode.textContent = this.currentColor.toUpperCase();
    
    // 색상에 따라 텍스트 색상 조정
    const luminance = this.getLuminance(this.currentColor);
    const textColor = luminance > 0.5 ? '#333333' : '#ffffff';
    colorCode.style.color = textColor;
  }

  // 배경 그라디언트 업데이트
  updateBackgroundGradient() {
    const rgb = this.hexToRgb(this.currentColor);
    if (rgb) {
      const { r, g, b } = rgb;
      const lighterColor = `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`;
      const darkerColor = `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`;
      
      document.body.style.background = `linear-gradient(135deg, ${this.currentColor} 0%, ${lighterColor} 50%, ${darkerColor} 100%)`;
    }
  }

  // 색상 저장
  saveCurrentColor() {
    if (this.savedColors.includes(this.currentColor)) {
      this.showToast('이미 저장된 색상입니다!', 'error');
      return;
    }

    this.savedColors.push(this.currentColor);
    this.saveSavedColors();
    this.renderSavedColors();
    this.showToast('색상이 저장되었습니다!', 'success');
  }

  // Clear 버튼 표시/숨김 관리
  updateClearButtonVisibility() {
    const clearBtn = document.getElementById('clear-saved');
    if (clearBtn) {
      clearBtn.style.display = this.savedColors.length > 0 ? 'block' : 'none';
    }
  }

  // 저장된 색상 렌더링
  renderSavedColors() {
    const savedList = document.getElementById('saved-list');
    savedList.innerHTML = '';

    if (this.savedColors.length === 0) {
      savedList.innerHTML = '<p style="color: #666; grid-column: 1/-1; text-align: center;">저장된 색상이 없습니다</p>';
    } else {
      this.savedColors.forEach((color, index) => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'saved-color';
        colorDiv.style.backgroundColor = color;
        colorDiv.title = `${color} (클릭: 적용, 더블클릭: 삭제)`;
        
        colorDiv.addEventListener('click', () => {
          this.currentColor = color;
          this.updateDisplay();
          this.updateBackgroundGradient();
          this.showToast(`${color} 색상을 적용했습니다!`, 'success');
        });

        // 더블클릭으로 삭제
        colorDiv.addEventListener('dblclick', (e) => {
          e.preventDefault();
          this.removeSavedColor(index);
        });

        savedList.appendChild(colorDiv);
      });
    }
    
    this.updateClearButtonVisibility();
  }

  // 저장된 색상 제거
  removeSavedColor(index) {
    this.savedColors.splice(index, 1);
    this.saveSavedColors();
    this.renderSavedColors();
    this.showToast('색상이 삭제되었습니다!', 'success');
  }

  // 모든 저장된 색상 삭제
  clearAllSavedColors() {
    if (this.savedColors.length === 0) {
      this.showToast('삭제할 색상이 없습니다!', 'error');
      return;
    }

    // 확인 대화상자 표시
    const confirmDelete = confirm(`저장된 ${this.savedColors.length}개의 색상을 모두 삭제하시겠습니까?`);
    
    if (confirmDelete) {
      this.savedColors = [];
      this.saveSavedColors();
      this.renderSavedColors();
      this.showToast('모든 색상이 삭제되었습니다!', 'success');
    }
  }

  // 팔레트 모드 토글
  togglePaletteMode() {
    this.isPaletteMode = !this.isPaletteMode;
    const paletteContainer = document.getElementById('palette-mode');
    const btn = document.getElementById('random-palette-btn');

    if (this.isPaletteMode) {
      paletteContainer.classList.remove('hidden');
      btn.textContent = '단일 색상 모드';
      this.generateColorPalette();
    } else {
      paletteContainer.classList.add('hidden');
      btn.textContent = '팔레트 모드';
    }
  }

  // 색상 팔레트 생성
  generateColorPalette() {
    const paletteColors = document.getElementById('palette-colors');
    paletteColors.innerHTML = '';

    // 5개의 조화로운 색상 생성
    const baseHue = Math.floor(Math.random() * 360);
    const colors = [];

    for (let i = 0; i < 5; i++) {
      const hue = (baseHue + (i * 72)) % 360; // 72도씩 회전
      const saturation = 60 + Math.floor(Math.random() * 30);
      const lightness = 40 + Math.floor(Math.random() * 30);
      colors.push(this.hslToHex(hue, saturation, lightness));
    }

    colors.forEach(color => {
      const colorDiv = document.createElement('div');
      colorDiv.className = 'palette-color';
      colorDiv.style.backgroundColor = color;
      colorDiv.title = color;
      
      colorDiv.addEventListener('click', () => {
        this.currentColor = color;
        this.updateDisplay();
        this.updateBackgroundGradient();
        this.showToast(`${color} 색상을 적용했습니다!`, 'success');
      });

      paletteColors.appendChild(colorDiv);
    });
  }

  // 색상 코드 복사
  async copyColorCode() {
    try {
      await navigator.clipboard.writeText(this.currentColor);
      this.showToast('색상 코드가 복사되었습니다!', 'success');
    } catch (err) {
      // 클립보드 API가 지원되지 않는 경우 대체 방법
      const textArea = document.createElement('textarea');
      textArea.value = this.currentColor;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showToast('색상 코드가 복사되었습니다!', 'success');
    }
  }

  // 토스트 메시지 표시
  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // 로컬 스토리지에 색상 저장
  saveSavedColors() {
    try {
      localStorage.setItem('savedColors', JSON.stringify(this.savedColors));
    } catch (e) {
      console.warn('로컬 스토리지에 저장할 수 없습니다:', e);
    }
  }

  // 로컬 스토리지에서 색상 불러오기
  loadSavedColors() {
    try {
      const saved = localStorage.getItem('savedColors');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('로컬 스토리지에서 불러올 수 없습니다:', e);
      return [];
    }
  }
}

// 페이지 로드 시 ColorPicker 인스턴스 생성
document.addEventListener('DOMContentLoaded', () => {
  new ColorPicker();
  
  // 초기 로딩 애니메이션
  const container = document.querySelector('.container');
  container.style.opacity = '0';
  container.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    container.style.transition = 'all 0.6s ease';
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
  }, 100);
});