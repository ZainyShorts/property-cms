// pages/login.js
'use client'
import { useState } from 'react';
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Login() {

   const { data, error:test } = useSWR('/api/me', fetcher);

  if (test) return <div>Error loading user</div>;
  if (!data) return <div>Loading...</div>;
  if(data) console.log(data)


  return (
    <div >
      <h1>useSWR</h1>
      <br/>
      <button onClick={useSWR}> tesets useSWR</button>
      <br/>
    </div>
  );
}
