"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { HomepageHero, PortfolioPayload, SitePortfolioItem } from "@/lib/content";
import {
  ConsultationRequest,
  ConsultationStatus,
  consultationStatusLabels,
} from "@/lib/consultations";

const statusOptions = Object.keys(consultationStatusLabels) as ConsultationStatus[];
const defaultHeroForm: HomepageHero = {
  id: "main",
  eyebrow: "아파트 전문 인테리어",
  title: "당신의 일상을 예술로 바꾸는 공간",
  description:
    "레몬하우스 양산점이 제안하는 프리미엄 아파트 인테리어 솔루션. 수천 건의 시공 노하우로 생활에 맞는 집을 완성합니다.",
  background_image_url:
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/81f6913b97-f8d90312708e182715ae.png",
  primary_label: "시공사례 보기",
  primary_href: "#portfolio",
  secondary_label: "빠른 견적 문의",
  secondary_href: "#consultation",
  updated_at: null,
};

const emptyPortfolioForm: PortfolioPayload = {
  title: "",
  apartment: "",
  size: "30평대",
  style: "",
  image_url: "",
  description: "",
  sort_order: 100,
  is_published: true,
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"consultations" | "hero" | "portfolio">(
    "consultations",
  );
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [heroForm, setHeroForm] = useState<HomepageHero>(defaultHeroForm);
  const [portfolioItems, setPortfolioItems] = useState<SitePortfolioItem[]>([]);
  const [portfolioForm, setPortfolioForm] = useState<PortfolioPayload>(emptyPortfolioForm);
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadingField, setUploadingField] = useState<"hero" | "portfolio" | null>(null);

  const metrics = useMemo(() => {
    return {
      total: requests.length,
      new: requests.filter((request) => request.status === "new").length,
      scheduled: requests.filter((request) => request.status === "scheduled").length,
    };
  }, [requests]);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setRequests([]);
      return;
    }

    loadAdminContent();
  }, [isAuthenticated]);

  async function loadAdminContent() {
    try {
      await Promise.all([loadRequests(), loadHero(), loadPortfolioItems()]);
    } catch {
      setErrorMessage("관리자 콘텐츠를 불러오지 못했습니다.");
      setIsLoading(false);
    }
  }

  async function checkSession() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/session");
      const data = (await readJson(response)) as { authenticated?: boolean };

      setIsAuthenticated(Boolean(data.authenticated));
    } catch {
      setErrorMessage("관리자 세션을 확인하지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = (await readJson(response)) as { error?: string };

      if (!response.ok) {
        setErrorMessage(data.error ?? "로그인에 실패했습니다.");
        return;
      }
    } catch {
      setErrorMessage("로그인 요청을 처리하지 못했습니다.");
      return;
    }

    setPassword("");
    setIsAuthenticated(true);
  }

  async function loadRequests() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/consultations");
      const data = (await readJson(response)) as {
        data?: ConsultationRequest[];
        error?: string;
      };

      if (!response.ok) {
        setErrorMessage(data.error ?? "문의 목록을 불러오지 못했습니다.");
        setRequests([]);
        return;
      }

      setRequests(data.data ?? []);
    } catch {
      setErrorMessage("문의 목록을 불러오지 못했습니다.");
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStatus(id: string, status: ConsultationStatus) {
    const response = await fetch(`/api/admin/consultations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = (await readJson(response)) as { error?: string };

    if (!response.ok) {
      setErrorMessage(data.error ?? "상태 변경에 실패했습니다.");
      return;
    }

    setRequests((current) =>
      current.map((request) => (request.id === id ? { ...request, status } : request)),
    );
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthenticated(false);
    setRequests([]);
    setPortfolioItems([]);
  }

  async function loadHero() {
    const response = await fetch("/api/admin/homepage/hero");
    const data = (await readJson(response)) as { data?: HomepageHero; error?: string };

    if (!response.ok) {
      setErrorMessage(data.error ?? "메인 화면을 불러오지 못했습니다.");
      return;
    }

    if (data.data) {
      setHeroForm(data.data);
    }
  }

  async function saveHero(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const response = await fetch("/api/admin/homepage/hero", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(heroForm),
    });
    const data = (await readJson(response)) as { data?: HomepageHero; error?: string };

    if (!response.ok) {
      setErrorMessage(data.error ?? "메인 화면 저장에 실패했습니다.");
      return;
    }

    if (data.data) {
      setHeroForm(data.data);
    }
    setSuccessMessage("메인 화면을 저장했습니다.");
  }

  async function uploadImage(file: File, folder: "hero" | "portfolio") {
    setErrorMessage("");
    setSuccessMessage("");
    setUploadingField(folder);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });
      const data = (await readJson(response)) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setErrorMessage(data.error ?? "이미지 업로드에 실패했습니다.");
        return null;
      }

      setSuccessMessage("이미지를 업로드했습니다. 저장 버튼을 눌러 반영하세요.");
      return data.url;
    } catch {
      setErrorMessage("이미지 업로드에 실패했습니다.");
      return null;
    } finally {
      setUploadingField(null);
    }
  }

  async function loadPortfolioItems() {
    const response = await fetch("/api/admin/portfolio");
    const data = (await readJson(response)) as {
      data?: SitePortfolioItem[];
      error?: string;
    };

    if (!response.ok) {
      setErrorMessage(data.error ?? "시공사례를 불러오지 못했습니다.");
      return;
    }

    setPortfolioItems(data.data ?? []);
  }

  async function savePortfolio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!portfolioForm.image_url) {
      setErrorMessage("시공사례 이미지를 업로드해주세요.");
      return;
    }

    const endpoint = editingPortfolioId
      ? `/api/admin/portfolio/${editingPortfolioId}`
      : "/api/admin/portfolio";
    const method = editingPortfolioId ? "PATCH" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(portfolioForm),
    });
    const data = (await readJson(response)) as {
      data?: SitePortfolioItem;
      error?: string;
    };

    if (!response.ok) {
      setErrorMessage(data.error ?? "시공사례 저장에 실패했습니다.");
      return;
    }

    setPortfolioForm({ ...emptyPortfolioForm });
    setEditingPortfolioId(null);
    setSuccessMessage("시공사례를 저장했습니다.");
    await loadPortfolioItems();
  }

  function editPortfolio(item: SitePortfolioItem) {
    setPortfolioForm({
      title: item.title,
      apartment: item.apartment,
      size: item.size,
      style: item.style,
      image_url: item.image_url,
      description: item.description,
      sort_order: item.sort_order,
      is_published: item.is_published,
    });
    setEditingPortfolioId(item.id);
    setActiveTab("portfolio");
  }

  async function deletePortfolio(id: string) {
    setErrorMessage("");
    setSuccessMessage("");

    const response = await fetch(`/api/admin/portfolio/${id}`, {
      method: "DELETE",
    });
    const data = (await readJson(response)) as { error?: string };

    if (!response.ok) {
      setErrorMessage(data.error ?? "시공사례 삭제에 실패했습니다.");
      return;
    }

    setSuccessMessage("시공사례를 삭제했습니다.");
    await loadPortfolioItems();
  }

  if (!isAuthenticated) {
    return (
      <main className="admin-page auth-page">
        <section className="admin-auth-card">
          <a className="admin-logo" href="/">
            <img src="/logo.png" alt="Lemon House" />
            <span>Admin</span>
          </a>
          <h1>관리자 로그인</h1>
          <p>관리자 계정으로 접속해 웹사이트 문의를 확인합니다.</p>

          <form onSubmit={login}>
            <label>
              아이디
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="admin"
                required
              />
            </label>
            <label>
              비밀번호
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="admin"
                required
              />
            </label>
            <button className="button button-primary" type="submit">
              로그인
            </button>
          </form>

          {isLoading ? <p className="admin-note">세션을 확인하는 중입니다.</p> : null}
          {errorMessage ? <p className="admin-note error">{errorMessage}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <a className="admin-logo" href="/">
          <img src="/logo.png" alt="Lemon House" />
          <span>Admin</span>
        </a>
        <div>
          <span>{username}</span>
          <button type="button" onClick={signOut}>
            로그아웃
          </button>
        </div>
      </header>

      <section className="admin-hero">
        <div>
          <span>Admin</span>
          <h1>콘텐츠 관리</h1>
          <p>문의, 메인 화면, 시공사례 콘텐츠를 관리합니다.</p>
        </div>
        <button type="button" onClick={loadAdminContent}>
          새로고침
        </button>
      </section>

      <nav className="admin-tabs" aria-label="관리 메뉴">
        <button
          className={activeTab === "consultations" ? "active" : ""}
          type="button"
          onClick={() => setActiveTab("consultations")}
        >
          문의 관리
        </button>
        <button
          className={activeTab === "hero" ? "active" : ""}
          type="button"
          onClick={() => setActiveTab("hero")}
        >
          메인 화면
        </button>
        <button
          className={activeTab === "portfolio" ? "active" : ""}
          type="button"
          onClick={() => setActiveTab("portfolio")}
        >
          시공사례
        </button>
      </nav>

      <section className="admin-metrics" aria-label="문의 현황">
        <article>
          <span>전체</span>
          <strong>{metrics.total}</strong>
        </article>
        <article>
          <span>신규</span>
          <strong>{metrics.new}</strong>
        </article>
        <article>
          <span>상담 예약</span>
          <strong>{metrics.scheduled}</strong>
        </article>
      </section>

      {errorMessage ? <p className="admin-note error">{errorMessage}</p> : null}
      {successMessage ? <p className="admin-note">{successMessage}</p> : null}

      {activeTab === "consultations" ? <section className="admin-list">
        {isLoading ? <p className="empty-state">문의 목록을 불러오는 중입니다.</p> : null}
        {!isLoading && requests.length === 0 ? (
          <p className="empty-state">아직 접수된 문의가 없습니다.</p>
        ) : null}

        {requests.map((request) => (
          <article className="request-card" key={request.id}>
            <div className="request-main">
              <div>
                <span>{new Date(request.created_at).toLocaleString("ko-KR")}</span>
                <h2>{request.name}</h2>
                <p>{request.message || "상담 내용이 입력되지 않았습니다."}</p>
              </div>
              <select
                value={request.status}
                onChange={(event) =>
                  updateStatus(request.id, event.target.value as ConsultationStatus)
                }
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {consultationStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
            <dl>
              <div>
                <dt>연락처</dt>
                <dd>
                  <a href={`tel:${request.phone}`}>{request.phone}</a>
                </dd>
              </div>
              <div>
                <dt>주소</dt>
                <dd>{request.address || "-"}</dd>
              </div>
              <div>
                <dt>평수</dt>
                <dd>{request.home_size || "-"}</dd>
              </div>
              <div>
                <dt>예산</dt>
                <dd>{request.budget || "-"}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section> : null}

      {activeTab === "hero" ? (
        <section className="admin-editor-panel">
          <form className="admin-editor-form" onSubmit={saveHero}>
            <h2>메인 화면 편집</h2>
            <label>
              배지 문구
              <input
                value={heroForm.eyebrow}
                onChange={(event) => setHeroForm({ ...heroForm, eyebrow: event.target.value })}
                required
              />
            </label>
            <label>
              제목
              <input
                value={heroForm.title}
                onChange={(event) => setHeroForm({ ...heroForm, title: event.target.value })}
                required
              />
            </label>
            <label>
              설명
              <textarea
                rows={4}
                value={heroForm.description}
                onChange={(event) =>
                  setHeroForm({ ...heroForm, description: event.target.value })
                }
                required
              />
            </label>
            <label>
              배경 이미지 업로드
              <input
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }

                  const url = await uploadImage(file, "hero");
                  if (url) {
                    setHeroForm({ ...heroForm, background_image_url: url });
                  }
                  event.target.value = "";
                }}
                type="file"
              />
            </label>
            {heroForm.background_image_url ? (
              <div className="admin-image-preview">
                <img src={heroForm.background_image_url} alt="메인 화면 배경 미리보기" />
                <span>{uploadingField === "hero" ? "업로드 중..." : "현재 배경 이미지"}</span>
              </div>
            ) : null}
            <button className="button button-primary" type="submit">
              메인 화면 저장
            </button>
          </form>
        </section>
      ) : null}

      {activeTab === "portfolio" ? (
        <section className="admin-content-grid">
          <form className="admin-editor-form" onSubmit={savePortfolio}>
            <h2>{editingPortfolioId ? "시공사례 수정" : "시공사례 등록"}</h2>
            <label>
              제목
              <input
                value={portfolioForm.title}
                onChange={(event) =>
                  setPortfolioForm({ ...portfolioForm, title: event.target.value })
                }
                required
              />
            </label>
            <label>
              아파트명
              <input
                value={portfolioForm.apartment}
                onChange={(event) =>
                  setPortfolioForm({ ...portfolioForm, apartment: event.target.value })
                }
                required
              />
            </label>
            <div className="form-grid">
              <label>
                평수
                <select
                  value={portfolioForm.size}
                  onChange={(event) =>
                    setPortfolioForm({
                      ...portfolioForm,
                      size: event.target.value as PortfolioPayload["size"],
                    })
                  }
                >
                  <option>20평대</option>
                  <option>30평대</option>
                  <option>40평대 이상</option>
                </select>
              </label>
              <label>
                스타일
                <input
                  value={portfolioForm.style}
                  onChange={(event) =>
                    setPortfolioForm({ ...portfolioForm, style: event.target.value })
                  }
                  required
                />
              </label>
            </div>
            <label>
              이미지 업로드
              <input
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }

                  const url = await uploadImage(file, "portfolio");
                  if (url) {
                    setPortfolioForm({ ...portfolioForm, image_url: url });
                  }
                  event.target.value = "";
                }}
                type="file"
              />
            </label>
            {portfolioForm.image_url ? (
              <div className="admin-image-preview">
                <img src={portfolioForm.image_url} alt="시공사례 이미지 미리보기" />
                <span>{uploadingField === "portfolio" ? "업로드 중..." : "현재 시공사례 이미지"}</span>
              </div>
            ) : null}
            <label>
              설명
              <textarea
                rows={4}
                value={portfolioForm.description}
                onChange={(event) =>
                  setPortfolioForm({ ...portfolioForm, description: event.target.value })
                }
                required
              />
            </label>
            <div className="form-grid">
              <label>
                정렬 순서
                <input
                  type="number"
                  value={portfolioForm.sort_order}
                  onChange={(event) =>
                    setPortfolioForm({
                      ...portfolioForm,
                      sort_order: Number(event.target.value),
                    })
                  }
                  required
                />
              </label>
              <label className="checkbox admin-checkbox">
                <input
                  checked={portfolioForm.is_published}
                  onChange={(event) =>
                    setPortfolioForm({ ...portfolioForm, is_published: event.target.checked })
                  }
                  type="checkbox"
                />
                공개
              </label>
            </div>
            <div className="admin-form-actions">
              <button className="button button-primary" type="submit">
                {editingPortfolioId ? "수정 저장" : "시공사례 등록"}
              </button>
              {editingPortfolioId ? (
                <button
                  type="button"
                  onClick={() => {
                    setPortfolioForm({ ...emptyPortfolioForm });
                    setEditingPortfolioId(null);
                  }}
                >
                  취소
                </button>
              ) : null}
            </div>
          </form>

          <div className="admin-portfolio-list">
            {portfolioItems.map((item) => (
              <article className="admin-portfolio-card" key={item.id}>
                <img src={item.image_url} alt={item.title} />
                <div>
                  <span>{item.is_published ? "공개" : "비공개"} · {item.size}</span>
                  <h3>{item.title}</h3>
                  <p>{item.apartment} · {item.style}</p>
                  <div>
                    <button type="button" onClick={() => editPortfolio(item)}>
                      수정
                    </button>
                    <button type="button" onClick={() => deletePortfolio(item.id)}>
                      삭제
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {portfolioItems.length === 0 ? (
              <p className="empty-state">등록된 시공사례가 없습니다.</p>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}

async function readJson(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {
      error: response.ok ? undefined : "서버 응답을 읽지 못했습니다.",
    };
  }
}
