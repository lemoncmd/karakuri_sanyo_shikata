# 絡繰算用仕方

以候文算術之儀を致候絡繰に御座候

## 例え

```
一、ひずばず之儀
毎々数甲を壱ゟ佰迄壱を以足し候乍
　若甲、拾伍を以剰余之儀を致し候段、零に御座候ハヽ
　　〽ひずばずを以書附之儀を致し候て
　不然若甲、伍を以剰余之儀を致し候段、零に御座候ハヽ
　　〽ばずを以書附之儀を致し候て
　不然若甲、参を以剰余之儀を致し候段、零に御座候ハヽ
　　〽ひずを以書附之儀を致し候て
　不然
　　甲を以書附之儀を致し候事
　如斯御座候事
如斯御座候
ひずばず之儀仍如件
```

## 貢献致度候ハヽ

先ず以下指図被実行下度候。
一度為候得者再応無為共無差支候。

```bash
$ npm install
```

次ニ文法書を組立候。
grammar.neを更新致候ハヽ又追付被実行下度候。

```bash
$ npm run build:grammar
```

或源文之解析結果を知度候ハヽ以下被実行下度候。

```bash
$ npx ts-node src/main.ts path/to/sourcecode.kss
# 源文之儘実行致度候ハヽ
$ npx ts-node src/main.ts path/to/sourcecode.kss --run
# 椎言葉を得度候ハヽ
$ npx ts-node src/main.ts path/to/sourcecode.kss --backend=c
```

試験者以下可被為候。

```bash
$ npx jest
```

## 外様絡

- [内核虚擬機探検隊にて発表致候段](https://drive.google.com/file/d/1G1_XYhIkj6In17V_ZoStBd7i-AJuUmf0/view?usp=sharing)
