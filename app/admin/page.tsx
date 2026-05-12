"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ConsultationRequest,
  ConsultationStatus,
  consultationStatusLabels,
} from "@/lib/consultations";
import { supabase } from "@/lib/supabase";

const statusOptions = Object.keys(consultationStatusLabels) as ConsultationStatus[];

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");
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
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setRequests([]);
      return;
    }

    loadRequests();
  }, [session]);

  async function loadRequests() {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("consultation_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    setRequests((data ?? []) as ConsultationRequest[]);
    setIsLoading(false);
  }

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage("");
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setAuthMessage("로그인 링크를 이메일로 보냈습니다.");
  }

  async function updateStatus(id: string, status: ConsultationStatus) {
    const { error } = await supabase
      .from("consultation_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setRequests((current) =>
      current.map((request) => (request.id === id ? { ...request, status } : request)),
    );
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (!session) {
    return (
      <main className="admin-page auth-page">
        <section className="admin-auth-card">
          <a className="admin-logo" href="/">
            <img src="/logo.png" alt="Lemon House" />
            <span>Admin</span>
          </a>
          <h1>관리자 로그인</h1>
          <p>Supabase Auth에 등록된 관리자 이메일로 로그인 링크를 받아 접속합니다.</p>

          <form onSubmit={sendMagicLink}>
            <label>
              이메일
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                required
              />
            </label>
            <button className="button button-primary" type="submit">
              로그인 링크 받기
            </button>
          </form>

          {authMessage ? <p className="admin-note">{authMessage}</p> : null}
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
          <span>{session.user.email}</span>
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
