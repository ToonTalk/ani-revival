"""Take the film noise out of the "Cinderella 1978" narration: a Wiener filter whose noise
estimate follows the quietest level in each frequency band over the last couple of seconds
(minimum statistics), so it keeps up with noise that changes - the band near 800 Hz waxes and
wanes, and 111.5-117.5 s is a splice with almost no noise at all.
Called by tools/clean-narration.sh. Needs numpy.
Usage: python denoise_narration.py in.wav out.wav [floor_db] [window_s]
  floor_db  how far a band may be turned down (default 15)
  window_s  how far back to look for the quietest level (default 2.0)"""
import sys
import wave
import numpy as np


def read(path):
    with wave.open(path) as w:
        assert w.getnchannels() == 1 and w.getsampwidth() == 2, "mono 16-bit please"
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768, w.getframerate()


def write(path, x, sr):
    y = np.clip(np.round(x * 32767), -32768, 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(y.tobytes())


def stft(x, n, hop):
    win = np.sqrt(np.hanning(n + 1)[:n])
    pad = np.concatenate([np.zeros(n), x, np.zeros(n)])
    frames = np.lib.stride_tricks.sliding_window_view(pad, n)[::hop]
    return np.fft.rfft(frames * win, axis=1), win, len(pad)


def istft(X, win, n, hop, length, total):
    frames = np.fft.irfft(X, n, axis=1) * win
    out = np.zeros(total)
    norm = np.zeros(total)
    for i, fr in enumerate(frames):
        out[i * hop:i * hop + n] += fr
        norm[i * hop:i * hop + n] += win ** 2
    out = out / np.maximum(norm, 1e-8)
    return out[n:n + length]


def running_min(a, width):
    """Minimum over the last `width` frames, per column."""
    out = np.empty_like(a)
    # block minima, then the minimum of two blocks, keeps it fast
    for i in range(len(a)):
        out[i] = a[max(0, i - width + 1):i + 1].min(axis=0)
    return out


def denoise(x, sr, floor_db=15.0, window_s=2.0):
    n, hop = 2048, 512
    X, win, total = stft(x, n, hop)
    P = np.abs(X) ** 2
    # smooth the power over time, then follow its minimum
    S = np.empty_like(P)
    S[0] = P[0]
    for i in range(1, len(P)):
        S[i] = 0.85 * S[i - 1] + 0.15 * P[i]
    width = int(window_s * sr / hop)
    M = running_min(S, width)
    # the minimum of a smoothed noise power sits below its mean; measured on the titles
    # (120-155 s, noise only) the mean is about 3 times the tracked minimum for a 2 s window (2.8 for 1.5 s, 3.4 for 3 s)
    bias = 3.0
    N = np.maximum(M * bias, 1e-14)
    # decision-directed Wiener gain (Ephraim and Malah), with a floor against musical noise
    gmin = 10 ** (-floor_db / 20)
    G = np.empty_like(P)
    prev = np.zeros(P.shape[1])
    for i in range(len(P)):
        post = P[i] / N[i]
        prior = 0.98 * prev / N[i] + 0.02 * np.maximum(post - 1, 0)
        g = prior / (1 + prior)
        g = np.maximum(g, gmin)
        G[i] = g
        prev = (g ** 2) * P[i]
    # smooth the gain a little across frequency so single bins don't twinkle
    k = np.array([0.25, 0.5, 0.25])
    G = np.apply_along_axis(lambda r: np.convolve(r, k, mode="same"), 1, G)
    return istft(X * G, win, n, hop, len(x), total), N


if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    floor_db = float(sys.argv[3]) if len(sys.argv) > 3 else 15.0
    window_s = float(sys.argv[4]) if len(sys.argv) > 4 else 2.0
    x, sr = read(src)
    y, _ = denoise(x, sr, floor_db, window_s)
    write(dst, y, sr)
