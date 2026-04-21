"use client";

// react
import { useState } from "react";

// next-intl
import { useTranslations } from "next-intl";

// antd
import { Table, Input, Empty, List, Flex, Grid } from "antd";
import type { TableProps } from "antd";

// ant design icons
import { SearchOutlined } from "@ant-design/icons";

// styles
import styles from "./DataTable.module.css";

const { useBreakpoint } = Grid;

interface DataTableProps<T> extends TableProps<T> {
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  toolbarRight?: React.ReactNode;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  mobileCardRender?: (item: T) => React.ReactNode;
}

const DataTable = <T extends object>({
  onSearch,
  searchPlaceholder,
  toolbarRight,
  total,
  page = 1,
  pageSize = 10,
  onPageChange,
  mobileCardRender,
  ...tableProps
}: DataTableProps<T>) => {
  const t = useTranslations("common");
  const [searchValue, setSearchValue] = useState("");
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const toolbar = (onSearch || toolbarRight) && (
    <Flex
      justify="space-between"
      align={isMobile ? "stretch" : "center"}
      vertical={isMobile}
      gap={12}
      className={styles.toolbar}
    >
      {onSearch && (
        <Input.Search
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          placeholder={searchPlaceholder || t("search")}
          allowClear
          style={isMobile ? undefined : { width: 280 }}
          prefix={<SearchOutlined />}
        />
      )}
      {toolbarRight && (
        <Flex gap={8} justify="flex-end">
          {toolbarRight}
        </Flex>
      )}
    </Flex>
  );

  if (isMobile && mobileCardRender) {
    return (
      <>
        {toolbar}
        <List
          dataSource={tableProps.dataSource as T[]}
          loading={tableProps.loading}
          renderItem={(item) => (
            <List.Item className={styles.listItem}>
              {mobileCardRender(item)}
            </List.Item>
          )}
          locale={{
            emptyText: (
              <Empty
                description={t("noData")}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          pagination={
            total !== undefined
              ? {
                  current: page,
                  pageSize,
                  total,
                  onChange: onPageChange,
                  showSizeChanger: false,
                  size: "small",
                  align: "center",
                }
              : false
          }
        />
      </>
    );
  }

  return (
    <>
      {toolbar}

      <Table
        {...tableProps}
        locale={{
          emptyText: (
            <Empty
              description={t("noData")}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
        pagination={
          total !== undefined
            ? {
                current: page,
                pageSize,
                total,
                onChange: onPageChange,
                showSizeChanger: true,
                showTotal: (tot) => t("total", { count: tot }),
              }
            : tableProps.pagination
        }
        scroll={isMobile ? { x: "max-content" } : undefined}
      />
    </>
  );
};

export default DataTable;
