
# Qiniu Node.js SDK Documentation

Source: https://developer.qiniu.com/kodo/1289/nodejs

## 简介
此 SDK 适用于 Node.js v6 及以上版本。使用此 SDK 构建您的网络应用程序，能让您以非常便捷的方式将数据安全地存储到七牛云上。无论您的网络应用是一个网站程序，还是包括从云端（服务端程序）到终端（手持设备应用）的架构服务和应用，通过七牛云及其 SDK，都能让您应用程序的终端用户高速上传和下载，同时也让您的服务端更加轻盈。

Node.js SDK 属于七牛服务端 SDK 之一，主要有如下功能：
- 提供生成客户端上传所需的上传凭证的功能
- 提供文件从服务端直接上传七牛的功能
- 提供对七牛空间中文件进行管理的功能
- 提供对七牛空间中文件进行处理的功能
- 提供七牛 CDN 相关的刷新，预取，日志功能

## 开源
- [Node.js SDK 项目地址](https://github.com/qiniu/nodejs-sdk)
- [Node.js SDK 发布地址](https://github.com/qiniu/nodejs-sdk/releases)
- [Node.js SDK 历史文档](/kodo/sdk/3828/node-js-v6)

## 安装
推荐使用npm来安装：

## 鉴权
Node.js SDK 的所有功能，都需要合法的授权。授权凭证的签算需要七牛账号下的一对有效的 Access Key 和 Secret Key ，这对密钥可以通过如下步骤获得：
- 点击[注册 🔗](https://portal.qiniu.com/signup)开通七牛开发者帐号
- 如果已有账号，直接登录七牛开发者后台，点击[这里 🔗](https://portal.qiniu.com/user/key)查看 Access Key 和 Secret Key

## 文件上传
- [上传流程](#upload-flow)
- [客户端上传凭证](#upload-token)
  - [简单上传凭证](#simple-uptoken)
  - [覆盖上传凭证](#overwrite-uptoken)
  - [自定义上传回复凭证](#returnbody-uptoken)
  - [带回调业务服务器的凭证](#callback-uptoken)
  - [带数据处理的凭证](#pfop-uptoken)
  - [带自定义参数的凭证](#param-uptoken)
  - [综合上传凭证](#general-uptoken)
- [服务器直传](#server-upload)
  - [构建配置类](#upload-config)
  - [文件上传（表单方式）](#form-upload-file)
  - [字节数组上传（表单方式）](#form-upload-bytes)
  - [数据流上传（表单方式）](#form-upload-stream)
  - [文件分片上传（断点续传）](#resume-upload-file)
  - [数据流分片上传（断点续传）](#resume-upload-stream)
  - [解析自定义回复内容](#upload-result-parse)
  - [业务服务器验证存储服务回调](#upload-callback-verify)
  - [上传加速](#upload-transfer-acceleration)

### 上传流程
文件上传分为客户端上传（主要是指网页端和移动端等面向终端用户的场景）和服务端上传两种场景，具体可以参考文档[业务流程](/kodo/manual/1205/programming-model)。

服务端 SDK 在上传方面主要提供两种功能，一种是生成客户端上传所需要的上传凭证，另外一种是直接上传文件到云端。

### 客户端上传凭证
客户端（移动端或者 Web 端）上传文件的时候，需要从客户自己的业务服务器获取上传凭证，而这些上传凭证是通过服务端的 SDK 来生成的，然后通过客户自己的业务 API 分发给客户端使用。根据上传的业务需求不同，Node.js SDK 支持丰富的上传凭证生成方式。

创建各种上传凭证之前，我们需要定义好其中鉴权对象 mac：

#### 简单上传的凭证
最简单的上传凭证只需要 AccessKey，SecretKey 和 Bucket 就可以。

默认情况下，在不指定上传凭证的有效时间情况下，默认有效期为 1 个小时。也可以自行指定上传凭证的有效期，例如：

#### 覆盖上传的凭证
覆盖上传除了需要简单上传所需要的信息之外，还需要想进行覆盖的文件名称，这个文件名称同时可是客户端上传代码中指定的文件名，两者必须一致。

#### 自定义上传回复的凭证
默认情况下，文件上传到存储之后，在没有设置returnBody或者回调相关的参数情况下，存储返回给上传端的回复格式为hash和key，例如：

有时候我们希望能自定义这个返回的 JSON 格式的内容，可以通过设置 returnBody 参数来实现，在 returnBody 中，我们可以使用七牛支持的[魔法变量](/kodo/manual/1235/vars#magicvar)和[自定义变量](/kodo/manual/1235/vars#xvar)。

则文件上传到存储之后，收到的回复内容如下：

#### 带回调业务服务器的凭证
上面生成的自定义上传回复的上传凭证适用于上传端（无论是客户端还是服务端）和存储服务器之间进行直接交互的情况下。在客户端上传的场景之下，有时候客户端需要在文件上传到存储之后，从业务服务器获取相关的信息，这个时候就要用到存储的上传回调及相关回调参数的设置。

在使用了上传回调的情况下，客户端收到的回复就是业务服务器响应存储服务的 JSON 格式内容。

通常情况下，我们建议使用 application/json 格式来设置 callbackBody，保持数据格式的统一性。实际情况下，callbackBody 也支持 application/x-www-form-urlencoded 格式来组织内容，这个主要看业务服务器在接收到 callbackBody 的内容时如何解析。例如：

#### 带数据处理的凭证
SDK 支持在文件上传到存储之后，立即对其进行多种指令的数据处理，这个只需要在生成的上传凭证中指定相关的处理参数即可。
- 队列 pipeline 请参阅[创建私有队列](https://portal.qiniu.com/dora/media-gate/pipeline)；转码操作具体参数请参阅[音视频转码](/dora/api/audio-and-video-transcoding-avthumb)；saveas 请参阅[处理结果另存](/dora/api/processing-results-save-saveas)。
- 闲时任务的功能介绍、使用场景、定价，详见 [闲时任务策略说明](/dora/api/12668/Idle-time-task-strategy)。

也可以支持使用工作流模版替代数据处理指令。工作流模板是预先编排好的一系列媒体处理流程（如转码、截图、视频拼接等各类处理），登录 [对象存储控制台](https://portal.qiniu.com/kodo/bucket) 进行创建，详情参考[工作流模板操作指南](/kodo/development_guidelines/12745/workflow-template)，persistentWorkflowTemplateID 对应工作流模板列表的名称字段
- 需要注意的是，persistentWorkflowTemplateID 和 persistentOps 两个参数只能二选一。

#### 带自定义参数的凭证
SDK 支持客户端上传文件的时候定义一些自定义参数，这些参数可以在 returnBody 和 callbackBody 里面和存储牛内置支持的魔法变量（即系统变量）通过相同的方式来引用。这些自定义的参数名称必须以 x: 开头。例如客户端上传的时候指定了自定义的参数x:name和x:age分别是string和int类型。那么可以通过下面的方式引用：

或者

#### 综合上传凭证
上面的生成上传凭证的方法，都是通过设置[上传策略 🔗](/kodo/manual/1206/put-policy)相关的参数来支持的，这些参数可以通过不同的组合方式来满足不同的业务需求，可以灵活地组织你所需要的上传凭证。

### 服务端直传
服务端直传是指客户利用服务端 SDK 从服务端直接上传文件到存储，交互的双方一般都在机房里面，所以服务端可以自己生成上传凭证，然后利用 SDK 中的上传逻辑进行上传，最后从存储服务获取上传的结果，这个过程中由于双方都是业务服务器，所以很少利用到上传回调的功能，而是直接自定义returnBody来获取自定义的回复内容。

#### 构建配置类
存储支持空间创建在不同的机房，在使用 Node.js SDK 中的 FormUploader 和 ResumeUploader 上传文件之前，必须要构建一个上传用的 config 对象，在该对象中，可以使用默认配置，也可以指定空间对应的区域以及其他的一些影响上传的参数。

若不配置区域，将会通过 AK 与 Bucket 查询对应区域。若非必要，建议不配置区域信息。

使用对应区域 ID 可生成对应的 RegionsProvider。区域 ID 请参考[存储区域文档](/kodo/1671/region-endpoint-fq)。

`config.zone` 已弃用，目前仅兼容支持，若需要配置请尽快更新使用 `config.regionsProvider`。

若同时配置 config.zone 与 config.regionsProvider，则优先使用 config.regionsProvider。

其中关于Zone对象和区域的关系如下：

| 区域 | Zone 对象 |
|------|-----------|
| 华东-浙江 | qiniu.zone.Zone_z0 |
| 华东-浙江 2 | qiniu.zone.Zone_cn_east_2 |
| 华北-河北 | qiniu.zone.Zone_z1 |
| 华南-广东 | qiniu.zone.Zone_z2 |
| 北美-洛杉矶 | qiniu.zone.Zone_na0 |
| 亚太-新加坡（原东南亚） | qiniu.zone.Zone_as0 |

#### 文件上传（表单方式）
最简单的就是上传本地文件，直接指定文件的完整路径即可上传。

#### 字节数组上传（表单方式）
可以支持将内存中的字节数组上传到空间中。

#### 数据流上传（表单方式）
这里演示的是ReadableStream对象的上传。

#### 文件分片上传（断点续传）
可以选择分片上传版本，推荐上传时制定 putExtra.version = ‘v2’，表示 分片上传 v2 版，默认分片上传 v1 版，兼容历史情况。若需深入了解上传方式之间的区别，请参阅上传类型中 [表单上传](/kodo/manual/1272/form-upload) 、[分片上传 v1 版](/kodo/manual/1650/chunked-upload) 和 [分片上传 v2 版](/kodo/6364/multipartupload-interface) 接口说明。

#### 数据流分片上传（断点续传）
这里演示的是ReadableStream对象的上传。

### 解析自定义回复内容
有些情况下，存储返回给上传端的内容不是默认的 hash 和 key 形式，这种情况下，可能出现在自定义 returnBody 或者自定义了 callbackBody 的情况下，前者一般是服务端直传的场景，而后者则是接受上传回调的场景，这两种场景之下，都涉及到需要将自定义的回复进行内容解析，一般建议在交互过程中，都采用 JSON 的方式，这样处理起来方法比较一致，而且 JSON 的方法最通用，在 Node.js 里面处理 JSON 的回复相当地方便，基本上了解回复结构就可以处理，这里不再赘述。

### 业务服务器验证存储服务回调
在上传策略里面设置了上传回调相关参数的时候，存储服务在文件上传到服务器之后，会主动地向callbackUrl发送 POST 请求的回调，回调的内容为callbackBody模版所定义的内容，如果这个模版里面引用了[魔法变量](/kodo/manual/vars#magicvar)或者[自定义变量](/kodo/manual/1235/vars#xvar)，那么这些变量会被自动填充对应的值，然后在发送给业务服务器。

业务服务器在收到来自存储服务的回调请求的时候，可以根据请求头部的Authorization字段来进行验证，查看该请求是否是来自存储服务的未经篡改的请求。

Node.js SDK 中提供了一个方法qiniu.util.isQiniuCallback来校验该头部是否合法：

### 上传加速

## 下载文件
- [公开空间](#public-get)
- [私有空间](#private-get)

文件下载分为公开空间的文件下载和私有空间的文件下载。

### 公开空间
对于公开空间，其访问的链接主要是将空间绑定的域名（可以是空间的默认域名或者是绑定的自定义域名）拼接上空间里面的文件名即可访问，标准情况下需要在拼接链接之前，将文件名进行urlencode以兼容不同的字符。

### 私有空间
对于私有空间，首先需要按照公开空间的文件访问方式构建对应的公开空间访问链接，然后再对这个链接进行私有授权签名。

## 资源管理
资源管理包括的主要功能有：
- [获取文件信息](#rs-stat)
- [修改文件 MimeType](#rs-chgm)
- [修改文件 Headers](#rs-chgm-h)
- [修改文件存储类型](#rs-chtype)
- [移动或重命名文件](#rs-move)
- [复制文件副本](#rs-copy)
- [删除空间中的文件](#rs-delete)
- [设置或更新文件生存时间](#rs-delete-after-days)
- [获取指定前缀文件列表](#rs-list)
- [抓取网络资源到空间](#rs-fetch)
- [更新镜像存储空间中文件内容](#rs-prefetch)
- [资源管理批量操作](#rs-batch)
  - [批量获取文件信息](#rs-batch-stat)
  - [批量修改文件类型](#rs-batch-chgm)
  - [批量删除文件](#rs-batch-delete)
  - [批量复制文件](#rs-batch-copy)
  - [批量移动或重命名文件](#rs-batch-move)
  - [批量更新文件的有效期](#rs-batch-deleteAfterDays)
  - [批量更新文件存储类型](#rs-batch-type)

资源管理相关的操作首先要构建BucketManager对象：

## 获取文件信息

## 修改文件 MimeType

## 修改文件 Headers

## 修改文件存储类型

## 移动或重命名文件
移动操作本身支持移动文件到相同，不同空间中，在移动的同时也可以支持文件重命名。唯一的限制条件是，移动的源空间和目标空间必须在同一个机房。

| 源空间 | 目标空间 | 源文件名 | 目标文件名 | 描述 |
|--------|----------|----------|------------|------|
| BucketA | BucketA | KeyA | KeyB | 相当于同空间文件重命名 |
| BucketA | BucketB | KeyA | KeyA | 移动文件到 BucketB，文件名一致 |
| BucketA | BucketB | KeyA | KeyB | 移动文件到 BucketB，文件名变成 KeyB |

move操作支持强制覆盖选项，即如果目标文件已存在，可以设置强制覆盖选项force来覆盖那个文件的内容。

## 复制文件副本
文件的复制和文件移动其实操作一样，主要的区别是移动后源文件不存在了，而复制的结果是源文件还存在，只是多了一个新的文件副本。

## 删除空间中的文件

## 设置或更新文件的生存时间
可以给已经存在于空间中的文件设置文件生存时间，或者更新已设置了生存时间但尚未被删除的文件的新的生存时间。

## 获取指定前缀的文件列表

## 抓取网络资源到空间

## 更新镜像空间中存储的文件内容

## 资源管理批量操作

### 批量获取文件信息

### 批量修改文件类型

### 批量删除文件

### 批量复制文件

### 批量移动或重命名文件

### 批量更新文件的有效期

### 批量更新文件存储类型

## 持久化数据处理

## 发送数据处理请求（数据处理指令）
对于已经保存到七牛空间的文件，可以通过发送持久化的数据处理指令来进行处理，这些指令支持七牛官方提供的指令，也包括客户自己开发的自定义数据处理的指令。数据处理的结果还可以通过七牛主动通知的方式告知业务服务器。

闲时任务的功能介绍、使用场景、定价，详见 [闲时任务策略说明](/dora/api/12668/Idle-time-task-strategy)。

## 发送数据处理请求（工作流模版）
也可以支持使用工作流模版替代数据处理指令。工作流模板是预先编排好的一系列媒体处理流程（如转码、截图、视频拼接等各类处理），登录 [对象存储控制台](https://portal.qiniu.com/kodo/bucket) 进行创建，详情参考[工作流模板操作指南](/kodo/development_guidelines/12745/workflow-template)，workflowTemplateID 对应工作流模板列表的名称字段

## 查询数据处理请求状态
由于数据处理是异步处理，可以根据发送处理请求时返回的 persistentId 去查询任务的处理进度，如果在设置了persistentNotifyUrl 的情况下，直接业务服务器等待处理结果通知即可，如果需要主动查询，可以采用如下代码中的：

## CDN 相关功能
- [文件刷新](#fusion-refresh-urls)
- [目录刷新](#fusion-refresh-dirs)
- [文件预取操作](#fusion-prefetch)
- [获取域名流量](#fusion-flux)
- [获取域名带宽](#fusion-bandwidth)
- [获取日志下载链接](#fusion-logs)
- [构建时间戳防盗链访问链接](#fusion-antileech)

在使用 CDN 相关功能之前，需要构建CdnManager对象：

## 文件刷新

## 目录刷新

## 文件预取操作

## 获取域名流量

## 获取域名带宽

## 获取日志下载链接

## 构建时间戳防盗链访问链接
具体算法可以参考：[时间戳防盗链](/fusion/kb/timestamp-hotlinking-prevention)

## API 参考
- [存储 API 参考](/kodo/api/3939/overview-of-the-api)
- [融合 CDN API 参考](/fusion)
- [官方数据处理 API 参考](/dora)

## 常见问题
- Node.js SDK 的 callback 保留了请求的错误信息，回复信息和头部信息，遇到问题时，可以都打印出来提交给我们排查问题。
- API 的使用，可以参考我们为大家精心准备的[使用实例](https://github.com/qiniu/nodejs-sdk/tree/master/examples)。

## 相关资源
如果您有任何关于我们文档或产品的建议和想法，欢迎您通过以下方式与我们互动讨论：
- [技术论坛](https://segmentfault.com/qiniu) - 在这里您可以和其他开发者愉快的讨论如何更好的使用七牛云服务
- [提交工单](https://support.qiniu.com/tickets/new) - 如果您的问题不适合在论坛讨论或希望及时解决，您也可以提交一个工单，我们的技术支持人员会第一时间回复您
- [博客](http://blog.qiniu.com) - 这里会持续更新发布市场活动和技术分享文章
- [微博](http://weibo.com/qiniutek)
- [常见问题](https://support.qiniu.com/question)

## 贡献代码
- Fork
- 创建您的特性分支 git checkout -b my-new-feature
- 提交您的改动 git commit -am ‘Added some feature’
- 将您的修改记录提交到远程 git 仓库 git push origin my-new-feature
- 然后到 github 网站的该 git 远程仓库的 my-new-feature 分支下发起 Pull Request

## 许可证
Copyright © 2014 qiniu.com
基于 MIT 协议发布:
- [www.opensource.org/licenses/MIT](http://www.opensource.org/licenses/MIT)

