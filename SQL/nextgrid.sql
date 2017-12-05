USE [Distribution]
GO


SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[gridnet_get_val]
(
	@str		NVARCHAR(50)
)
RETURNS NVARCHAR(10)
AS
BEGIN
	
	DECLARE @i INT

	SET @i = CHARINDEX('/', @str, 6)
	
	IF @i > 15
		SET @i = CHARINDEX('.', @str, 6)
	
	--'DMS/ONECO/ONECO.F2931.COMPSW.61455549XP/20009/SSMANACC/'
	--EMS/STUART.REGBYP.2RB1.SW/
	--DMS/ORNGTREE/ORANGETREE.F7362.SWT.297958945/412929-13/SSNAPLEF/
	RETURN SUBSTRING(@str, 5, (@i - 1) - 4)

END


GO

CREATE TABLE [dbo].[nextGrid_matrix](
	[date] [date] NOT NULL,
	[feeder_num] [nvarchar](20) NOT NULL,
	[substation] [nvarchar](50) NOT NULL,
	[region] [nvarchar](50) NOT NULL,
	[relay] [nvarchar](50) NULL,
	[gigx] [nvarchar](50) NULL,
	[gigx_change] [datetime] NULL,
	[customers] [int] NULL,
	[rank] [float] NULL,
	[today] [int] NULL,
	[yesterday] [int] NULL,
	[five_days_ago] [int] NULL,
	[ytd] [int] NULL,
	[priority_feeder] [nvarchar](20) NULL,
	[top_25_feeder] [bit] NULL,
 CONSTRAINT [PK_nextGrid_matrix] PRIMARY KEY CLUSTERED 
(
	[date] DESC,
	[feeder_num] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO


CREATE PROCEDURE [dbo].[nextGrid_get_InvReport]
       	@dtbegin		DATETIME,
       	@dtend			DATETIME		= NULL,
       	@feeder_num		NVARCHAR(20)

       AS

       SELECT        mo.substation, mo.fdr_num, mo.relay_type, mo.customers, mo.mom_ystd, mo.nine_160days_mom_cnt, mo.frtn_220days_mom_cnt, mo.ytd, mo.twlv_moe, mo.tln,
                                mo.cause_code, mo.event_info, mo.fdr_n_ystd, mo.lat_n_ystd, mo.comments, mo.date, SUBSTRING(mo.event_info, 21, 21) AS 'event_dttm', mo.voltage, mo.miles,
                                mo.ma, mo.status_code, mo.rid, mo.weather, mo.accuracy, mo.file_upload, mo.investigation_wr, mo.follow_up_wr, ISNULL(dash.momentaries.momentary_count, 0)
                                AS 'momstoday', ISNULL(nextGrid_cause_codes.[description], '') AS 'cause_description'
       FROM            momentaries_report AS mo LEFT OUTER JOIN
                                nextGrid_cause_codes ON mo.cause_code = nextGrid_cause_codes.cause_code LEFT OUTER JOIN
                                dash.momentaries ON mo.fdr_num = dash.momentaries.feeder_num
       WHERE (mo.fdr_num = @feeder_num OR @feeder_num IS NULL)
       AND (mo.date BETWEEN @dtbegin AND @dtend)
       ORDER BY momstoday DESC, mo.mom_ystd DESC, [date] DESC

       GO

GRANT EXEC ON [dbo].[nextGrid_get_InvReport] TO PUBLIC
GO



CREATE NONCLUSTERED INDEX IX_momentaries_report ON dbo.momentaries_report
	(
	fdr_num,
	date DESC
	) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


CREATE PROCEDURE [dbo].[cfci_counts]
AS
BEGIN
	SELECT [NM_FEEDER], COUNT(*) as cfci
		,(select  count(*) 
		from dbo.tb_fci f
		join dbo.tbl_uni_stations s on f.ID_SUBSTATION = s.id
		where f.NM_FEEDER = A.NM_FEEDER
		and f.DEPL_STAT in ('In-Service')  and  f.CD_PHASE = 'A') AS fci
	FROM [Distribution].[dbo].[TB_FCI] AS A
	GROUP BY [NM_FEEDER]
	ORDER BY 1
END
GO
GRANT EXECUTE ON [dbo].[cfci_counts] TO PUBLIC
GO


CREATE PROCEDURE [dbo].[nextGrid_update_InvReport]
	@rid			INT,
	@comments		NVARCHAR(MAX)		= NULL,
	@tln			NVARCHAR(20)		= NULL,
	@cause_code		NVARCHAR(20)		= NULL

AS
BEGIN
	UPDATE [dbo].[momentaries_report]
	   SET [tln]		= ISNULL(@tln, tln)
		,[comments]		= ISNULL(@comments, comments)	
		,[cause_code]	= ISNULL(@cause_code, cause_code)
	WHERE rid = @rid
END

GO

GRANT EXEC ON [dbo].[nextGrid_update_InvReport] TO PUBLIC
GO


CREATE PROCEDURE [dbo].[nextGrid_get_lightningYTD_Raw]
       	@yr		INT,
       	@lat1	FLOAT,
       	@lat2	FLOAT,
       	@long1	FLOAT,
       	@long2	FLOAT
       AS

       	SELECT [Latitude] AS 'Lat'
       		  ,[Longitude] AS 'Lng'
       	FROM [Distribution].[weather].[lightning]
       	WHERE [YEAR] = @yr
       	AND Latitude BETWEEN @lat1 AND @lat2
       	AND Longitude BETWEEN @long1 AND @long2
       GO


GRANT EXEC ON [dbo].[nextGrid_get_lightningYTD_Raw] TO Public
GO

select UPPER(SLID) 'slid', name_first 'fname', name_last 'lname'
from tbl_UNI_personnel
where slid in (
'amu0psg',
'lxp04tq',
'Eds0kpm',
'gxm0e1o',
'DLD0CVC',
'SAH0OXE',
'KAF0KN6',
'DLD0CVC',
'MAM0NWV',
'RAT0XIG',
'JXS0HD2',
'GXA0KW7',
'EXV0OKL',
'AXS0NA7',
'txj0oxl',
'MLB0MI0',
'KLG00AO',
'KLS0MEE',
'JCW0DOB',
'GPH0RNT',
'DXC0LVQ',
'JXP0P0U',
'RXT0PC1',
'RAG0FMX',
'LLC00TB',
'MDA0NRA',
'Jhe0fwp',
'axk0fl2',
'jrt0t3e',
'JJS0CR1',
'TLW0ILZ',
'cww0dtr',
'mxv0wui',
'sat0dgg',
'dra0iau',
'lxa0bb6',
'wfm0nzq',
'axs0na7',
'mxv0wui',
'dkp0msi',
'fjp09h0',
'jxm0ovo',
'cxa0u9t',
'jrv0ebk',
'ceo0lyq',
'jad0wha',
'tpk0ksc',
'mvs0cxo',
'axm0g22',
'jel0oov',
'CJB02IB',
'AMV0SN3',
'EXC0S9I',
'DMC0BPL',
'JXD0XET',
'LXD0UA2',
'CXM0WWS',
'ABV0T3C',
'AMV0SN3',
'JXZ0U1B',
'SBA0CZ4',
'NXC0B5R',
'LIL0NAO',
'JTT0WWL',
'GXJ0Q0S',
'JXV0RWH',
'jxv0rwh',
'bxh0un0',
'axm0f9f',
'gca0r21',
'jaf0n6l',
'JXT03QW',
'DRC0MP3',
'JIS0IC6',
'SXT02EJ',
'PXE0C2D',
'RBH0QKE',
'KMN0LX6',
'txj0oxl',
'jxv0rwh',
'wdw0ntk',
'EXA0RQJ',
'MXG0RYP',
'RAC09XV',
'AJH0E3S',
'AXG0QK9',
'DLH0FMR',
'cxs0w3k')
order by lname, fname

USE [Distribution]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[nextGrid_get_alsmax]
(
	@id			INT,
	@yr			INT,
	@phase		VARCHAR(3)
)
RETURNS INT
AS
BEGIN

	DECLARE @val INT

	SELECT @val = ISNULL(MAX(YTDCount), 0)
	FROM [Distribution].[ami].[capStone]
	WHERE DATEPART(yyyy,meter_event_tmstmp) LIKE @yr
	--WHERE DATEPART(yyyy,meter_event_tmstmp) LIKE '2017'
	AND [xfrmr_phase] = @phase
	AND [ts_parent_fpl_id] = @id
	RETURN @val

END
GO

GRANT EXEC ON [dbo].[nextGrid_get_alsmax] TO PUBLIC
GO

/****** Script for SelectTopNRows command from SSMS  ******/
SELECT TOP 1000 [id]
      ,[service_center]
      ,[description]
      ,[region]
      ,[id_region]
      ,[id_ma]
      ,[fl_delete]
      ,[fl_gridaware_pushed]
	  ,[boundary]
      ,[boundary].STAsText()
      ,[lightning_zone]
      ,[idap_aka]
      ,[urban_suburban]
  FROM [Distribution].[dbo].[tbl_UNI_service_center]
  where fl_delete = 0

  USE [Distribution]
GO

SELECT [id]
      ,[id_region]
      ,[name]
      ,[description]
      ,[fl_deleted]
	  ,boundary
	  ,[boundary].STGeometryType() AS 'geometrytype'

      ,[boundary].STAsText() AS 'boundary2'
      ,[id_control_center]
      ,[id_tis]
  FROM [dbo].[tbl_UNI_management_areas]
  --where name = 'BR'

GO



CREATE PROCEDURE [dbo].[nextGrid_get_als_2year]
       	@sub		NVARCHAR(30)

       AS

       SELECT [ts_parent_fpl_id]
		,[dbo].[nextGrid_get_alsmax](     [ts_parent_fpl_id]           ,YEAR(GETDATE() - 365)   ,'A') AS aYTDPrev
       ,[dbo].[nextGrid_get_alsmax](     [ts_parent_fpl_id]           ,YEAR(GETDATE())                ,'A') AS aYTDCurrent
       ,[dbo].[nextGrid_get_alsmax](     [ts_parent_fpl_id]           ,YEAR(GETDATE() - 365)   ,'B') AS bYTDPrev
       ,[dbo].[nextGrid_get_alsmax](     [ts_parent_fpl_id]           ,YEAR(GETDATE())                ,'B') AS bYTDCurrent
       ,[dbo].[nextGrid_get_alsmax](     [ts_parent_fpl_id]           ,YEAR(GETDATE() - 365)   ,'C') AS cYTDPrev
       ,[dbo].[nextGrid_get_alsmax](     [ts_parent_fpl_id]           ,YEAR(GETDATE())                ,'C') AS cYTDCurrent
FROM [Distribution].[ami].[capStone]
WHERE [substn_name] = @sub
GROUP BY [ts_parent_fpl_id]

GO

GRANT EXEC ON [dbo].[nextGrid_get_als_2year] TO PUBLIC
<<<<<<< HEAD
GO
=======
GO

