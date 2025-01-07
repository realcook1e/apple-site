import {
	FC,
	SyntheticEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);

import { hightlightsSlides } from "../consts";
import { VideoState } from "../types/video.types";
import { pauseImg, playImg, replayImg } from "../utils";

const VideoCarousel: FC = () => {
	const videoRef = useRef<HTMLVideoElement[]>([]);
	const videoSpanRef = useRef<HTMLSpanElement[]>([]);
	const videoDivRef = useRef<HTMLSpanElement[]>([]);

	const [video, setVideo] = useState<VideoState>({
		isEnd: false,
		startPlay: false,
		videoId: 0,
		isLastVideo: false,
		isPlaying: false,
	});

	const { isEnd, isLastVideo, isPlaying, startPlay, videoId } = video;

	const [loadedData, setLoadedData] = useState<SyntheticEvent[]>([]);
	const [progressBarWidth, setProgressBarWidth] = useState<string>(
		window.innerWidth < 760
			? "10vw"
			: window.innerWidth < 1200
			? "7vw"
			: "4vw"
	);

	useGSAP(() => {
		gsap.to("#slider", {
			transform: `translateX(${-100 * videoId}%)`,
			duration: 2,
			ease: "power2.inOut",
		});

		gsap.to(videoRef.current[videoId], {
			scrollTrigger: {
				trigger: videoRef.current[videoId],
				toggleActions: "restart none none none",
				onLeave: () => {
					if (!videoRef.current[videoId].ended) {
						handleProcess("pause");
					} else {
						if (videoId !== 3) {
							handleProcess("video-end");
						} else {
							handleProcess("video-last");
						}
					}

					if (videoId !== 3) {
						setVideo(prev => ({ ...prev, isLastVideo: false }));
					}
				},

				onEnter: () => {
					if (!videoRef.current[videoId].ended) {
						handleProcess("start-play");
						handleProcess("play");
					} else {
						if (videoId !== 3) {
							handleProcess("video-end");
						} else {
							handleProcess("video-last");
						}
					}

					if (videoId !== 3) {
						setVideo(prev => ({ ...prev, isLastVideo: false }));
					}
				},

				onEnterBack: () => {
					if (!videoRef.current[videoId].ended) {
						handleProcess("start-play");
						handleProcess("play");
					} else {
						if (videoId !== 3) {
							handleProcess("video-end");
						} else {
							handleProcess("video-last");
						}
					}
					if (videoId !== 3) {
						setVideo(prev => ({ ...prev, isLastVideo: false }));
					}
				},
			},
		});
	}, [isEnd, videoId]);

	useEffect(() => {
		if (loadedData.length > 3) {
			if (!isPlaying) {
				videoRef.current[videoId].pause();
			} else {
				if (startPlay) videoRef.current[videoId].play();
			}
		}
	}, [startPlay, videoId, isPlaying, loadedData]);

	const handleLoadedMetadata = (
		evt: SyntheticEvent<HTMLVideoElement>
	) => setLoadedData(prev => [...prev, evt]);

	const handleResize = () => {
		setProgressBarWidth(
			window.innerWidth < 760
				? "10vw"
				: window.innerWidth < 1200
				? "7vw"
				: "4vw"
		);
	};

	useEffect(() => {
		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		let currentProgress = 0;
		const span = videoSpanRef.current;

		if (span && span[videoId]) {
			const animation = gsap.to(span[videoId], {
				onUpdate: () => {
					const progress = Math.ceil(animation.progress() * 100);

					if (progress !== currentProgress) {
						currentProgress = progress;

						gsap.to(videoDivRef.current[videoId], {
							width: progressBarWidth,
						});

						gsap.to(span[videoId], {
							width: `${currentProgress}%`,
							backgroundColor: "white",
						});
					}
				},

				onComplete: () => {
					if (isPlaying) {
						gsap.to(videoDivRef.current[videoId], {
							width: "12px",
						});
						gsap.to(span[videoId], {
							backgroundColor: "#afafaf",
						});
					}
				},
			});

			if (videoId === 0) {
				animation.restart();
			}

			const animationUpdate = () => {
				animation.progress(
					videoRef.current[videoId].currentTime /
						hightlightsSlides[videoId].videoDuration
				);
			};

			gsap.ticker.add(animationUpdate);
		}
	}, [videoId, startPlay, progressBarWidth, isPlaying]);

	const handleProcess = (
		type:
			| "play"
			| "pause"
			| "start-play"
			| "video-reset"
			| "video-end"
			| "video-last",
		i?: number
	) => {
		switch (type) {
			case "video-end":
				if (i !== undefined)
					setVideo(prevVideo => ({
						...prevVideo,
						isEnd: true,
						videoId: i + 1,
					}));
				break;
			case "video-last":
				setVideo(prevVideo => ({ ...prevVideo, isLastVideo: true }));
				break;
			case "video-reset":
				setVideo(prevVideo => ({
					...prevVideo,
					isLastVideo: false,
					videoId: 0,
				}));
				break;
			case "start-play":
				setVideo(prevVideo => ({ ...prevVideo, startPlay: true }));
				break;
			case "play":
				setVideo(prevVideo => ({ ...prevVideo, isPlaying: true }));
				break;
			case "pause":
				setVideo(prevVideo => ({ ...prevVideo, isPlaying: false }));
				break;
		}
	};

	return (
		<>
			<div className="flex items-center">
				{hightlightsSlides.map((list, i) => (
					<div
						key={list.id}
						id="slider"
						className="sm:pr-20 pr-10"
					>
						<div className="video-carousel_container">
							<div
								className="w-full h-full flex-center
							rounded-3xl overflow-hidden bg-black"
							>
								<video
									id="video"
									playsInline={true}
									preload="auto"
									muted
									className={`${
										list.id === 2 ? "translate-x-44" : ""
									} pointer-events-none`}
									ref={el => (el ? (videoRef.current[i] = el) : null)}
									onPlay={() => {
										setVideo(prevVideo => ({
											...prevVideo,
											isPlaying: true,
										}));
									}}
									onEnded={() =>
										i !== 3
											? handleProcess("video-end", i)
											: handleProcess("video-last")
									}
									onLoadedMetadata={evt => handleLoadedMetadata(evt)}
								>
									<source
										src={list.video}
										type="video/mp4"
									/>
								</video>
							</div>
							<div className="absolute top-12 left-[5%] z-10">
								{list.textLists.map((text, i) => (
									<p
										key={i}
										className="md:text-2xl text-xl font-medium"
									>
										{text}
									</p>
								))}
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="relative flex-center mt-10">
				<div
					className="flex-center py-5 px-7 
				bg-gray-300 backdrop-blur rounded-full"
				>
					{videoRef.current.map((_, i) => (
						<span
							key={i}
							ref={el => (el ? (videoDivRef.current[i] = el) : null)}
							className="mx-2 w-3 h-3 bg-gray-200
							rounded-full relative cursor-pointer"
						>
							<span
								className="absolute h-full w-full rounded-full"
								ref={el =>
									el ? (videoSpanRef.current[i] = el) : null
								}
							></span>
						</span>
					))}
				</div>
				<button
					className="control-btn"
					onClick={
						isLastVideo
							? () => handleProcess("video-reset")
							: !isPlaying
							? () => handleProcess("play")
							: () => handleProcess("pause")
					}
				>
					<img
						src={
							isLastVideo
								? replayImg
								: !isPlaying
								? playImg
								: pauseImg
						}
						alt={
							isLastVideo ? "replay" : !isPlaying ? "play" : "pause"
						}
					/>
				</button>
			</div>
		</>
	);
};
export default VideoCarousel;
