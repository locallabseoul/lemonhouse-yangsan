"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ConsultationRequest,
  ConsultationStatus,
  consultationStatusLabels,
} from "@/lib/consultations";

const statusOptions = Object.keys(consultationStatusLabels) as ConsultationStatus[];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

    loadRequests();
  }, [isAuthenticated]);

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
          <span>Consultations</span>
          <h1>견적 문의 관리</h1>
          <p>웹사이트로 접수된 상담 요청을 확인하고 진행 상태를 업데이트합니다.</p>
        </div>
        <button type="button" onClick={loadRequests}>
          새로고침
        </button>
      </section>

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

      <section className="admin-list">
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
      </section>
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
