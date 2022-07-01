import { useEffect, useMemo, useState } from "react";

import "./App.css"

function BreakPoint({start, end, firstStart, i})
{
	const Duration = useMemo(()=>{
		const time = end - start
		const h = Math.floor(time / 3600000)
		const m = Math.floor(time % 3600000 / 60000)
		const s = Math.floor(time % 60000 / 1000)
		const ms = Math.floor(time % 1000)

		return {
			h: ("0"+(h)).slice(-2),
			m: ("0"+(m)).slice(-2),
			s: ("0"+(s)).slice(-2),
			ms: ("00"+ms).slice(-3)
		}
	}, [start, end])

	const Total = useMemo(()=>{
		const time = end - firstStart
		const h = Math.floor(time / 3600000)
		const m = Math.floor(time % 3600000 / 60000)
		const s = Math.floor(time % 60000 / 1000)
		const ms = Math.floor(time % 1000)

		return {
			h: ("0"+(h)).slice(-2),
			m: ("0"+(m)).slice(-2),
			s: ("0"+(s)).slice(-2),
			ms: ("00"+ms).slice(-3)
		}
	}, [firstStart, end])

	return useMemo(()=>{
		return (
			<div key={i} style={{display: "flex", padding: 4}}>
				<div className="parts">{i+1}</div>
				<div className="times">{Duration.h}:{Duration.m}:{Duration.s}<span>.{Duration.ms}</span></div>
				<div className="times">{Total.h}:{Total.m}:{Total.s}<span>.{Total.ms}</span></div>
			</div>
		)
	}, [i, Duration, Total])
}

function App() {
	const [width, setWidth] = useState(window.innerWidth)
	const [height, setHeight] = useState(window.innerHeight)
	const [flexDirection, setFlexDirection] = useState(window.innerWidth>window.innerHeight?"row":"column")
	const [startTime, setStartTime] = useState(0)
	const [currTime, setCurrTime] = useState(0)
	const [breaks, setBreaks] = useState([])
	const [timer, setTimer] = useState(null)

	useEffect(()=>{
		window.addEventListener("resize", (x)=>{
			setWidth(window.innerWidth)
			setHeight(window.innerHeight)
			setFlexDirection(window.innerWidth>window.innerHeight?"row":"column")
		})
	}, [])

	const Total = useMemo(()=>{
		const time = currTime - startTime
		const h = Math.floor(time / 3600000)
		const m = Math.floor(time % 3600000 / 60000)
		const s = Math.floor(time % 60000 / 1000)
		const ms = Math.floor(time % 1000)

		return {
			h: ("0"+(h)).slice(-2),
			m: ("0"+(m)).slice(-2),
			s: ("0"+(s)).slice(-2),
			ms: ("00"+ms).slice(-3)
		}
	}, [startTime, currTime])

	const Duration = useMemo(()=>{
		const time = currTime - (breaks[breaks.length-1]??{end: startTime}).end
		const h = Math.floor(time / 3600000)
		const m = Math.floor(time % 3600000 / 60000)
		const s = Math.floor(time % 60000 / 1000)
		const ms = Math.floor(time % 1000)

		return {
			h: ("0"+(h)).slice(-2),
			m: ("0"+(m)).slice(-2),
			s: ("0"+(s)).slice(-2),
			ms: ("00"+ms).slice(-3)
		}
	}, [breaks, startTime, currTime])

	const StartBtn = useMemo(()=>{
		return (
			<button key="StartBtn" onClick={()=>{
				setStartTime(new Date().getTime())
				setCurrTime(new Date().getTime())
		
				setTimer(setInterval(()=>{
					setCurrTime(new Date().getTime())
				}, 1))
			}}>
				Start
			</button>
		)
	}, [])

	const ContinueBtn = useMemo(()=>{
		return (
			<button key="ContinueBtn" onClick={()=>{
				const time = new Date().getTime()
				setStartTime(time-(currTime-startTime))
				setCurrTime(time)

				setBreaks((prev)=>{
					const pauseTime = time - currTime
					return prev.map((x)=>{
						return {start: x.start + pauseTime, end: x.end + pauseTime, firstStart: x.firstStart + pauseTime}
					})
				})

				setTimer(setInterval(()=>{
					setCurrTime(new Date().getTime())
				}, 1))
			}}>
				Continue
			</button>
		)
	}, [startTime, currTime])

	const ClearBtn = useMemo(()=>{
		return (
			<button key="ClearBtn" onClick={()=>{
				setStartTime(0)
				setCurrTime(0)
				setBreaks([])
			}}>
				Clear
			</button>
		)
	}, [])

	const StopBtn = useMemo(()=>{
		return (
			<button key="StopBtn" onClick={()=>{
				setTimer((prev)=>{
					if (prev) clearInterval(prev)
					return null
				})
			}}>
				Stop
			</button>
		)
	}, [])

	const BreakBtn = useMemo(()=>{
		return (
			<button key="BreakBtn" onClick={()=>{
				setBreaks((prev)=>{
					if (prev.length === 0) return [{start: startTime, firstStart: startTime, end: new Date().getTime()}]
					return [...prev, {start: prev[prev.length -1].end, firstStart: startTime, end: new Date().getTime()}]
				})
			}}>
				Break
			</button>
		)
	}, [startTime])

	const PartsTable = useMemo(()=>{
		return (
			<div style={{flex: 1, display: "flex", flexDirection: "column", textAlign: "center", minHeight: height/2, maxHeight: height, borderLeft: flexDirection==="row"?"1px solid #999999":"", borderTop: flexDirection==="column"?"1px solid #999999":""}}>
				<div style={{display: "flex", flexDirection: "row", padding: 4, boxShadow: '0px 1px 4px #999999'}}>
					<div className="parts">Part</div>
					<div className="times">Duration</div>
					<div className="times">Total</div>
				</div>
				<div style={{flex:1, overflow: "auto"}}>
					{
						breaks.map((x, i)=>{
							return <BreakPoint i={i} start={x.start} end={x.end} firstStart={x.firstStart}/>
						}).reverse()
					}
				</div>
			</div>
		)
	}, [flexDirection, height, breaks])

	return useMemo(()=>{
		const displayBtns = []

		if (startTime === 0 && currTime === 0)
		{
			displayBtns.push(StartBtn)
		}

		if (!timer && startTime !== currTime)
		{
			displayBtns.push(ContinueBtn)
			displayBtns.push(ClearBtn)
		}

		if (timer)
		{
			displayBtns.push(StopBtn)
			displayBtns.push(BreakBtn)
		}

		return (
			<div style={{display: "flex", flexDirection: flexDirection, width: width, height: height}}>
				<div style={{flex: 1, minHeight: height/2, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16}}>
					<div className="MainTime">
						{Total.h}:{Total.m}:{Total.s}<span>.{Total.ms}</span>
					</div>
					{
						breaks.length > 0 ?
						<div className="SecondTime" style={{flex: 0, width: "100%"}}>
							Part {breaks.length+1}:<br/>
							{Duration.h}:{Duration.m}:{Duration.s}<span>.{Duration.ms}</span>
						</div>
						: null
					}
					<div className="BtnArea">
						{displayBtns.map((x)=>x)}
					</div>
				</div>
				{PartsTable}
			</div>
		)
	}, [
		flexDirection, width, height,
		startTime, currTime, breaks, timer,
		Total, Duration, PartsTable,
		StartBtn, StopBtn, ContinueBtn, ClearBtn, BreakBtn
	]);
}

export default App;
