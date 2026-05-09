"use client";

import { FormEvent, useMemo, useState } from "react";

type PortfolioItem = {
  title: string;
  apartment: string;
  size: "20평대" | "30평대" | "40평대 이상";
  style: string;
  image: string;
  description: string;
};

const portfolioItems: PortfolioItem[] = [
  {
    title: "따뜻한 감성의 화이트 우드 인테리어",
    apartment: "양산 물금 반도유보라",
    size: "30평대",
    style: "화이트 미니멀",
    image:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/fda278644d-48d95bc49c1a90f16dd8.png",
    description:
      "공간 효율을 높이고 따뜻한 색감으로 아늑한 분위기를 연출한 34평 아파트 시공 사례입니다.",
  },
  {
    title: "호텔 같은 품격의 모던 다크 키친",
    apartment: "양산 대방노블랜드",
    size: "40평대 이상",
    style: "모던 럭셔리",
    image:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/e75af31da0-c7375f8a751b109f9ddd.png",
    description:
      "고급 자재와 무게감 있는 컬러 매치로 완성한 대형 평수 주방 및 거실 리모델링입니다.",
  },
  {
    title: "수납과 디자인을 모두 잡은 침실",
    apartment: "양산 증산 이지더원",
    size: "20평대",
    style: "파스텔 코지",
    image:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/c4241842d7-c172536e55ed5c166643.png",
    description:
      "붙박이장으로 수납을 확보하고 부드러운 톤으로 편안한 휴식을 제공하는 침실입니다.",
  },
  {
    title: "가족 동선에 맞춘 오픈형 거실",
    apartment: "양산 사송 더샵데시앙",
    size: "30평대",
    style: "내추럴 모던",
    image:
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1200&q=80",
    description:
      "거실과 주방의 연결감을 살리고 아이가 있는 가족의 생활 동선을 중심으로 설계했습니다.",
  },
  {
    title: "차분한 무드의 프리미엄 욕실",
    apartment: "양산 이편한세상",
    size: "20평대",
    style: "스톤 그레이",
    image:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
    description:
      "톤 다운된 타일과 간접 조명으로 작은 욕실도 넓고 정돈되어 보이도록 완성했습니다.",
  },
  {
    title: "대형 평수에 맞춘 갤러리형 공간",
    apartment: "양산 우미린",
    size: "40평대 이상",
    style: "클래식 모던",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    description:
      "넓은 면적의 장점을 살려 수납, 조명, 마감재의 균형을 정교하게 맞춘 프로젝트입니다.",
  },
];

const reviews = [
  {
    name: "김*지 고객님",
    home: "물금 반도유보라 34평",
    text: "처음 상담부터 친절했고 원하는 화이트 우드 컨셉을 정확히 이해해주셨어요. 중간 소통도 잘되고 마감도 깔끔해서 만족합니다.",
  },
  {
    name: "이*훈 고객님",
    home: "대방노블랜드 42평",
    text: "오래된 아파트라 걱정이 많았는데 완전히 새집처럼 바뀌었습니다. 단열처럼 보이지 않는 부분까지 꼼꼼해서 믿음이 갔어요.",
  },
  {
    name: "박*영 고객님",
    home: "증산 이지더원 25평",
    text: "신혼집 인테리어를 맡겼는데 예산 안에서 효과가 큰 자재를 잘 추천해주셨어요. 디자인과 실용적인 동선 모두 만족합니다.",
  },
];

const aboutPoints = [
  {
    number: "01",
    title: "아파트 리모델링 전문",
    description: "양산 주요 단지 구조에 맞춘 수납, 조명, 동선 설계",
  },
  {
    number: "02",
    title: "예산 맞춤 자재 제안",
    description: "필수 공정과 선택 공정을 나눠 합리적인 견적 구성",
  },
  {
    number: "03",
    title: "현장 중심 일정 관리",
    description: "철거부터 마감까지 공정별 체크로 일정 지연 최소화",
  },
  {
    number: "04",
    title: "입주 후 사후관리",
    description: "생활하며 발견되는 작은 보완까지 빠르게 대응",
  },
];

const filters = ["전체", "20평대", "30평대", "40평대 이상"] as const;

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("전체");
  const [formState, setFormState] = useState<"idle" | "sent">("idle");

  const visiblePortfolio = useMemo(() => {
    if (activeFilter === "전체") {
      return portfolioItems;
    }

    return portfolioItems.filter((item) => item.size === activeFilter);
  }, [activeFilter]);

  function submitConsultation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("sent");
    event.currentTarget.reset();
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#hero" aria-label="레몬하우스 양산점 홈">
          <img src="/logo.png" alt="Lemon House" />
          <span>양산점</span>
        </a>

        <nav className="desktop-nav" aria-label="주요 메뉴">
          <a href="#about">브랜드 소개</a>
          <a href="#portfolio">시공사례</a>
          <a href="#reviews">고객리뷰</a>
          <a href="#contact">오시는 길</a>
        </nav>

        <a className="header-cta" href="#consultation">
          무료 견적 상담
        </a>

        <button
          className="menu-button"
          type="button"
          aria-label="모바일 메뉴 열기"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {isMenuOpen ? (
        <nav className="mobile-nav" aria-label="모바일 메뉴">
          <a href="#about" onClick={() => setIsMenuOpen(false)}>
            브랜드 소개
          </a>
          <a href="#portfolio" onClick={() => setIsMenuOpen(false)}>
            시공사례
          </a>
          <a href="#reviews" onClick={() => setIsMenuOpen(false)}>
            고객리뷰
          </a>
          <a href="#consultation" onClick={() => setIsMenuOpen(false)}>
            무료 견적 상담
          </a>
        </nav>
      ) : null}

      <main>
        <section id="hero" className="hero">
          <div className="hero-media" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="eyebrow">아파트 전문 인테리어</p>
            <h1>당신의 일상을 예술로 바꾸는 공간</h1>
            <p className="hero-copy">
              레몬하우스 양산점이 제안하는 프리미엄 아파트 인테리어 솔루션.
              수천 건의 시공 노하우로 생활에 맞는 집을 완성합니다.
            </p>
            <div className="hero-actions">
              <a className="button button-light" href="#portfolio">
                시공사례 보기
              </a>
              <a className="button button-primary" href="#consultation">
                빠른 견적 문의
              </a>
            </div>
          </div>
        </section>

        <section className="stats" aria-label="레몬하우스 양산점 핵심 지표">
          <div>
            <strong>10+</strong>
            <span>다년간의 노하우</span>
          </div>
          <div>
            <strong>5,000+</strong>
            <span>누적 시공 사례</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>직영 시공 시스템</span>
          </div>
          <div>
            <strong>A/S</strong>
            <span>철저한 사후관리</span>
          </div>
        </section>

        <section id="about" className="section about">
          <div className="section-heading align-left">
            <span>About</span>
            <h2>양산 아파트 구조와 생활 패턴을 이해하는 인테리어</h2>
          </div>
          <div className="about-grid">
            <p>
              레몬하우스 양산점은 상담, 디자인, 자재 선정, 현장 시공, 사후관리까지 한 흐름으로
              관리합니다. 보기 좋은 공간을 넘어 실제로 살기 편한 수납, 조명, 동선, 마감 품질을
              기준으로 제안합니다.
            </p>
            <div className="about-points">
              {aboutPoints.map((point) => (
                <article key={point.title}>
                  <span>{point.number}</span>
                  <h3>{point.title}</h3>
                  <p>{point.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="portfolio" className="section portfolio">
          <div className="section-heading">
            <span>Portfolio</span>
            <h2>양산점 시공사례</h2>
            <p>최신 트렌드와 고객의 니즈를 반영한 평수별 시공사례를 확인해보세요.</p>
          </div>

          <div className="filter-tabs" role="tablist" aria-label="시공사례 필터">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={filter === activeFilter ? "active" : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="portfolio-grid">
            {visiblePortfolio.map((item) => (
              <article className="portfolio-card" key={`${item.apartment}-${item.title}`}>
                <div className="portfolio-image">
                  <img src={item.image} alt={`${item.apartment} ${item.title}`} />
                  <span>{item.apartment}</span>
                </div>
                <div className="portfolio-body">
                  <div className="portfolio-meta">
                    <strong>{item.size}</strong>
                    <span>{item.style}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="reviews" className="section reviews">
          <div className="reviews-heading">
            <div className="section-heading align-left">
              <span>Reviews</span>
              <h2>고객 만족 후기</h2>
            </div>
            <p className="rating">평점 4.9/5.0 · 250+ 리뷰</p>
          </div>

          <div className="review-grid">
            {reviews.map((review) => (
              <article className="review-card" key={review.name}>
                <div>
                  <strong>{review.name}</strong>
                  <span>{review.home}</span>
                </div>
                <p>{review.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="consultation" className="section consultation">
          <div className="consultation-copy">
            <div className="section-heading align-left">
              <span>Consultation</span>
              <h2>
                새로운 시작을 위한 첫 걸음,
                <br />
                무료 견적 상담
              </h2>
            </div>
            <p>
              전문가가 라이프스타일과 예산에 맞춘 최적의 인테리어 솔루션을 제안합니다.
              방문 상담은 사전 예약제로 운영됩니다.
            </p>
            <div className="contact-list" id="contact">
              <a href="tel:16440402">
                <strong>대표전화</strong>
                <span>1644-0402</span>
                <small>평일 09:00 - 18:00</small>
              </a>
              <a
                href="https://map.naver.com/"
                target="_blank"
                rel="noreferrer"
              >
                <strong>양산점 오시는 길</strong>
                <span>경상남도 양산시 물금읍 물금로 123</span>
                <small>방문 상담 시 사전 예약 필수</small>
              </a>
            </div>
          </div>

          <form className="consultation-form" onSubmit={submitConsultation}>
            <h3>온라인 견적 문의</h3>
            <div className="form-grid">
              <label>
                이름
                <input name="name" placeholder="홍길동" required />
              </label>
              <label>
                연락처
                <input name="phone" placeholder="010-0000-0000" required type="tel" />
              </label>
            </div>
            <label>
              시공 현장 주소 또는 아파트명
              <input name="address" placeholder="예: 양산 물금 반도유보라 4차" />
            </label>
            <div className="form-grid">
              <label>
                평수
                <select name="size" defaultValue="30평대">
                  <option>20평 미만</option>
                  <option>20평대</option>
                  <option>30평대</option>
                  <option>40평대</option>
                  <option>50평 이상</option>
                </select>
              </label>
              <label>
                예산
                <input name="budget" placeholder="예: 3000만원" />
              </label>
            </div>
            <label>
              상담 내용
              <textarea
                name="message"
                rows={4}
                placeholder="원하시는 스타일이나 신경 쓰고 싶은 부분을 적어주세요."
              />
            </label>
            <label className="checkbox">
              <input name="privacy" type="checkbox" required />
              개인정보 수집 및 이용 동의
            </label>
            <button className="button button-primary" type="submit">
              무료 견적 신청하기
            </button>
            {formState === "sent" ? (
              <p className="form-note">문의가 접수되었습니다. 실제 운영 시 전송 API를 연결하면 됩니다.</p>
            ) : null}
          </form>
        </section>
      </main>

      <footer className="footer">
        <div>
          <img src="/logo.png" alt="Lemon House" />
          <p>
            레몬하우스 양산점은 고객님의 라이프스타일에 맞춘 주거 공간을 디자인하는
            아파트 전문 인테리어 브랜드입니다.
          </p>
        </div>
        <nav aria-label="푸터 메뉴">
          <a href="#about">브랜드 소개</a>
          <a href="#portfolio">시공사례</a>
          <a href="#reviews">고객리뷰</a>
          <a href="#consultation">견적문의</a>
        </nav>
        <address>
          경남 양산시 물금읍 물금로 123
          <br />
          1644-0402
          <br />
          평일 09:00 - 18:00
        </address>
      </footer>
    </>
  );
}
